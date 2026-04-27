from __future__ import annotations

import logging
import os
import subprocess
import sys
import time
from concurrent.futures import TimeoutError as FutureTimeoutError
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from django.conf import settings
from django.db import close_old_connections

from .models import DemoAnalysisJob
from .services import AwpyUnavailableError, DemoDownloadError, analyze_demo_file, download_demo_file

LOGGER = logging.getLogger(__name__)
PARSING_TIMEOUT_SECONDS = int(os.getenv("DEMO_PARSING_TIMEOUT_SECONDS", "180"))


def _analyze_with_timeout(demo_path: str | Path, *, sample_every: int) -> dict:
    parser_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="demo-parse")
    future = parser_executor.submit(analyze_demo_file, demo_path, sample_every)
    try:
        return future.result(timeout=max(1, PARSING_TIMEOUT_SECONDS))
    except FutureTimeoutError as exc:
        future.cancel()
        raise TimeoutError(
            f"Demo parsing timed out after {PARSING_TIMEOUT_SECONDS}s. Please try another demo file."
        ) from exc
    finally:
        parser_executor.shutdown(wait=False, cancel_futures=True)


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


def _safe_set_processing_state(job: DemoAnalysisJob, *, stage: str, progress: int, message: str) -> None:
    try:
        _set_processing_state(job, stage=stage, progress=progress, message=message)
    except Exception:  # noqa: BLE001
        LOGGER.exception("Could not update processing state for job %s", job.id)


def _analyze_with_timeout(demo_path: str | Path, *, sample_every: int) -> dict:
    parser_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="demo-parse")
    future = parser_executor.submit(analyze_demo_file, demo_path, sample_every)
    try:
        return future.result(timeout=max(1, PARSING_TIMEOUT_SECONDS))
    except FutureTimeoutError as exc:
        future.cancel()
        raise TimeoutError(
            f"Demo parsing timed out after {PARSING_TIMEOUT_SECONDS}s. Please try another demo file."
        ) from exc
    finally:
        parser_executor.shutdown(wait=False, cancel_futures=True)


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


def _recover_missing_demo_path(job: DemoAnalysisJob) -> Path:
    demo_path = Path(job.demo_file.path)
    if demo_path.exists():
        return demo_path

    search_dir = demo_path.parent
    original_name = Path(job.original_filename).name
    candidates: list[Path] = []

    if "_" in demo_path.name:
        _, _, stripped_name = demo_path.name.partition("_")
        if stripped_name:
            candidates.append(search_dir / stripped_name)

    candidates.append(search_dir / original_name)

    if original_name.endswith(".dem.gz"):
        base = original_name[: -len(".dem.gz")]
        suffix = ".dem.gz"
    else:
        base = Path(original_name).stem
        suffix = Path(original_name).suffix
    candidates.extend(sorted(search_dir.glob(f"{base}_*{suffix}")))

    for candidate in candidates:
        if candidate.exists():
            upload_to = str(job.demo_file.field.upload_to).strip("/")
            job.demo_file.name = f"{upload_to}/{candidate.name}" if upload_to else candidate.name
            job.save(update_fields=["demo_file", "updated_at"])
            return candidate

    raise FileNotFoundError(f"File not found: {demo_path}")


def _run_upload_job(job_id: str, sample_every: int) -> None:
    close_old_connections()
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DemoAnalysisJob.DoesNotExist:
        close_old_connections()
        return

    try:
        _safe_set_status(job, DemoAnalysisJob.Status.PROCESSING)
        _safe_set_processing_state(job, stage="preparing_file", progress=10, message="Preparing demo file...")
        demo_path = _recover_missing_demo_path(job)
        _safe_set_processing_state(job, stage="parsing_demo", progress=40, message="Parsing demo with AWPY...")
        result = _analyze_with_timeout(demo_path, sample_every=sample_every)
        _safe_set_processing_state(job, stage="generating_report", progress=85, message="Generating radar and report payload...")
        job.result = {
            **result,
            "processing": {
                "stage": "completed",
                "progress": 100,
                "message": "Analysis complete.",
            },
        }
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (AwpyUnavailableError, DemoDownloadError) as exc:
        _safe_set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except TimeoutError as exc:
        _safe_set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except TimeoutError as exc:
        _set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        _safe_set_processing_state(job, stage="failed", progress=100, message=f"Unexpected parser error: {exc}")
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = f"Unexpected parser error: {exc}"

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
        download_demo_file(demo_url, job.demo_file.path)
        _safe_set_processing_state(job, stage="parsing_demo", progress=40, message="Parsing demo with AWPY...")
        result = _analyze_with_timeout(job.demo_file.path, sample_every=sample_every)
        _safe_set_processing_state(job, stage="generating_report", progress=85, message="Generating radar and report payload...")
        job.result = {
            **result,
            "processing": {
                "stage": "completed",
                "progress": 100,
                "message": "Analysis complete.",
            },
        }
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (DemoDownloadError, AwpyUnavailableError) as exc:
        _safe_set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except TimeoutError as exc:
        _safe_set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except TimeoutError as exc:
        _set_processing_state(job, stage="failed", progress=100, message=str(exc))
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        _safe_set_processing_state(job, stage="failed", progress=100, message=f"Unexpected parser error: {exc}")
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = f"Unexpected parser error: {exc}"

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
