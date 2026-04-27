from __future__ import annotations

import logging
import multiprocessing
import os
import queue
import subprocess
import sys
import time
import traceback
from pathlib import Path

from django.conf import settings
from django.db import close_old_connections

from .models import DemoAnalysisJob
from .services import AwpyUnavailableError, DemoDownloadError, analyze_demo_file, download_demo_file

LOGGER = logging.getLogger(__name__)
PARSING_TIMEOUT_SECONDS = int(os.getenv("DEMO_PARSING_TIMEOUT_SECONDS", "180"))


def _parser_process_entrypoint(demo_path: str, sample_every: int, output_queue) -> None:
    try:
        result = analyze_demo_file(demo_path, sample_every=sample_every)
        output_queue.put(
            {
                "ok": True,
                "result": result,
            }
        )
    except BaseException:  # noqa: BLE001
        output_queue.put(
            {
                "ok": False,
                "error": traceback.format_exc(),
            }
        )
        raise


def _analyze_with_timeout(demo_path: str | Path, *, sample_every: int) -> dict:
    ctx = multiprocessing.get_context("spawn")
    output_queue = ctx.Queue()
    process = ctx.Process(
        target=_parser_process_entrypoint,
        args=(str(demo_path), int(sample_every), output_queue),
        daemon=False,
    )
    process.start()
    process.join(timeout=max(1, PARSING_TIMEOUT_SECONDS))

    if process.is_alive():
        process.terminate()
        process.join(timeout=5)
        if process.is_alive():
            process.kill()
            process.join(timeout=5)
        raise TimeoutError(f"Demo parsing timed out after {PARSING_TIMEOUT_SECONDS}s.")

    payload = None
    try:
        payload = output_queue.get_nowait()
    except queue.Empty:
        pass

    if payload and payload.get("ok"):
        return payload["result"]

    if payload and not payload.get("ok"):
        raise RuntimeError(payload.get("error") or "Parser process failed without traceback.")

    if process.exitcode != 0:
        raise RuntimeError(
            f"Parser process exited unexpectedly with code {process.exitcode}. "
            "No traceback was returned from child process."
        )

    raise RuntimeError("Parser process finished without returning result.")


def _save_job_with_retries(job: DemoAnalysisJob, *, update_fields: list[str], retries: int = 3) -> None:
    for attempt in range(1, retries + 1):
        try:
            job.save(update_fields=update_fields)
            return
        except Exception:  # noqa: BLE001
            LOGGER.exception("Job save failed on attempt %s/%s for job %s", attempt, retries, job.id)
            close_old_connections()
            if attempt < retries:
                time.sleep(0.25)
            else:
                raise


def _safe_set_status(job: DemoAnalysisJob, status: str) -> DemoAnalysisJob:
    job.status = status
    job.save(update_fields=["status", "updated_at"])
    return job


def _set_processing_state(job: DemoAnalysisJob, *, stage: str, progress: int, message: str) -> None:
    result = dict(job.result or {})
    result["processing"] = {
        "stage": stage,
        "progress": max(0, min(100, int(progress))),
        "message": message,
    }
    job.result = result
    job.save(update_fields=["result", "updated_at"])


def _safe_set_processing_state(job: DemoAnalysisJob, *, stage: str, progress: int, message: str) -> None:
    try:
        _set_processing_state(job, stage=stage, progress=progress, message=message)
    except Exception:  # noqa: BLE001
        LOGGER.exception("Could not update processing state for job %s", job.id)




def _recover_missing_demo_path(job: DemoAnalysisJob) -> Path:
    demo_path = Path(job.demo_file.path)
    if demo_path.exists():
        return demo_path

    search_dir = demo_path.parent
    original_name = Path(job.original_filename).name
    candidates = [search_dir / original_name]
    candidates.extend(sorted(search_dir.glob(f"*_{original_name}")))

    for candidate in candidates:
        if candidate.exists():
            job.demo_file.name = f"demos/{candidate.name}"
            job.save(update_fields=["demo_file", "updated_at"])
            return candidate

    raise FileNotFoundError(f"Demo file not found at expected path: {demo_path}")

def _resolve_demo_path(job: DemoAnalysisJob) -> Path:
    demo_path = Path(job.demo_file.path)
    if not demo_path.exists():
        raise FileNotFoundError(f"Demo file not found at expected path: {demo_path}")
    return demo_path


def _finalize_job_failure(job: DemoAnalysisJob, message: str, *, stage: str = "failed") -> None:
    _safe_set_processing_state(job, stage=stage, progress=100, message=message)
    job.status = DemoAnalysisJob.Status.FAILED
    job.error_message = message


def _run_upload_job(job_id: str, sample_every: int) -> None:
    close_old_connections()
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DemoAnalysisJob.DoesNotExist:
        close_old_connections()
        return

    demo_path = None
    try:
        _safe_set_status(job, DemoAnalysisJob.Status.PROCESSING)
        _safe_set_processing_state(job, stage="preparing_file", progress=10, message="Preparing demo file...")
        demo_path = _resolve_demo_path(job)
        LOGGER.info(
            "Starting upload demo analysis job=%s path=%s exists=%s size=%s sample_every=%s",
            job.id,
            demo_path,
            demo_path.exists(),
            demo_path.stat().st_size if demo_path.exists() else None,
            sample_every,
        )

        _safe_set_processing_state(job, stage="parsing_demo", progress=40, message="Parsing demo with AWPY...")
        LOGGER.info("Parsing started job=%s path=%s", job.id, demo_path)
        result = _analyze_with_timeout(demo_path, sample_every=sample_every)
        LOGGER.info("Parsing finished job=%s path=%s", job.id, demo_path)

        _safe_set_processing_state(job, stage="generating_report", progress=85, message="Generating radar and report payload...")
        job.result = {
            **result,
            "processing": {"stage": "completed", "progress": 100, "message": "Analysis complete."},
        }
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (AwpyUnavailableError, DemoDownloadError, FileNotFoundError, TimeoutError, RuntimeError) as exc:
        LOGGER.exception("Upload job failed job=%s path=%s error=%s", job.id, demo_path, exc)
        _finalize_job_failure(job, str(exc))
    except Exception as exc:  # noqa: BLE001
        LOGGER.exception("Unexpected upload parser error job=%s path=%s", job.id, demo_path)
        _finalize_job_failure(job, f"Unexpected parser error: {exc}")

    try:
        _save_job_with_retries(job, update_fields=["result", "status", "error_message", "updated_at"])
    except Exception:  # noqa: BLE001
        LOGGER.exception("Final save failed for upload job %s", job.id)
    close_old_connections()


def _run_import_job(job_id: str, demo_url: str, sample_every: int) -> None:
    close_old_connections()
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DemoAnalysisJob.DoesNotExist:
        close_old_connections()
        return

    try:
        _safe_set_status(job, DemoAnalysisJob.Status.PROCESSING)
        _safe_set_processing_state(job, stage="downloading_demo", progress=10, message="Downloading demo...")
        demo_path = Path(job.demo_file.path)
        download_demo_file(demo_url, demo_path)

        LOGGER.info(
            "Starting import demo analysis job=%s path=%s exists=%s size=%s url=%s sample_every=%s",
            job.id,
            demo_path,
            demo_path.exists(),
            demo_path.stat().st_size if demo_path.exists() else None,
            demo_url,
            sample_every,
        )
        _safe_set_processing_state(job, stage="parsing_demo", progress=40, message="Parsing demo with AWPY...")
        LOGGER.info("Parsing started job=%s path=%s", job.id, demo_path)
        result = _analyze_with_timeout(demo_path, sample_every=sample_every)
        LOGGER.info("Parsing finished job=%s path=%s", job.id, demo_path)

        _safe_set_processing_state(job, stage="generating_report", progress=85, message="Generating radar and report payload...")
        job.result = {
            **result,
            "processing": {"stage": "completed", "progress": 100, "message": "Analysis complete."},
        }
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (DemoDownloadError, AwpyUnavailableError, TimeoutError, RuntimeError) as exc:
        LOGGER.exception("Import job failed job=%s error=%s", job.id, exc)
        _finalize_job_failure(job, str(exc))
    except Exception as exc:  # noqa: BLE001
        LOGGER.exception("Unexpected import parser error job=%s", job.id)
        _finalize_job_failure(job, f"Unexpected parser error: {exc}")

    try:
        _save_job_with_retries(job, update_fields=["result", "status", "error_message", "updated_at"])
    except Exception:  # noqa: BLE001
        LOGGER.exception("Final save failed for import job %s", job.id)
    close_old_connections()


def _spawn_job_process(*args: str) -> None:
    manage_py = Path(settings.BASE_DIR) / "manage.py"
    cmd = [sys.executable, str(manage_py), "run_demo_job", *args]
    subprocess.Popen(  # noqa: S603
        cmd,
        cwd=str(settings.BASE_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
        close_fds=True,
    )


def enqueue_upload_job(job_id: str, sample_every: int) -> None:
    _spawn_job_process("--mode", "upload", "--job-id", job_id, "--sample-every", str(sample_every))


def enqueue_import_job(job_id: str, demo_url: str, sample_every: int) -> None:
    _spawn_job_process(
        "--mode",
        "import",
        "--job-id",
        job_id,
        "--demo-url",
        demo_url,
        "--sample-every",
        str(sample_every),
    )
