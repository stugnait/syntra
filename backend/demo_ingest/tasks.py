from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

from django.db import close_old_connections

from .models import DemoAnalysisJob
from .services import AwpyUnavailableError, DemoDownloadError, analyze_demo_file, download_demo_file

_EXECUTOR: ThreadPoolExecutor | None = None
_EXECUTOR_LOCK = Lock()


def _get_executor() -> ThreadPoolExecutor:
    global _EXECUTOR
    with _EXECUTOR_LOCK:
        if _EXECUTOR is None or getattr(_EXECUTOR, "_shutdown", False):
            _EXECUTOR = ThreadPoolExecutor(max_workers=2, thread_name_prefix="demo-ingest")
        return _EXECUTOR


def _submit_background(fn, *args) -> None:
    try:
        _get_executor().submit(fn, *args)
    except RuntimeError:
        # Happens during code reload/interpreter transitions in dev mode.
        with _EXECUTOR_LOCK:
            global _EXECUTOR
            _EXECUTOR = ThreadPoolExecutor(max_workers=2, thread_name_prefix="demo-ingest")
        _get_executor().submit(fn, *args)


def _safe_set_status(job: DemoAnalysisJob, status: str) -> DemoAnalysisJob:
    job.status = status
    job.save(update_fields=["status", "updated_at"])
    return job


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
        demo_path = _recover_missing_demo_path(job)
        result = analyze_demo_file(demo_path, sample_every=sample_every)
        job.result = result
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (AwpyUnavailableError, DemoDownloadError) as exc:
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = f"Unexpected parser error: {exc}"

    job.save(update_fields=["result", "status", "error_message", "updated_at"])
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
        download_demo_file(demo_url, job.demo_file.path)
        result = analyze_demo_file(job.demo_file.path, sample_every=sample_every)
        job.result = result
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except (DemoDownloadError, AwpyUnavailableError) as exc:
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = f"Unexpected parser error: {exc}"

    job.save(update_fields=["result", "status", "error_message", "updated_at"])
    close_old_connections()


def enqueue_upload_job(job_id: str, sample_every: int) -> None:
    _submit_background(_run_upload_job, job_id, sample_every)


def enqueue_import_job(job_id: str, demo_url: str, sample_every: int) -> None:
    _submit_background(_run_import_job, job_id, demo_url, sample_every)
