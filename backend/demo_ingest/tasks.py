from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
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


def _run_upload_job(job_id: str, sample_every: int) -> None:
    close_old_connections()
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DemoAnalysisJob.DoesNotExist:
        close_old_connections()
        return

    try:
        _safe_set_status(job, DemoAnalysisJob.Status.PROCESSING)
        result = analyze_demo_file(job.demo_file.path, sample_every=sample_every)
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
