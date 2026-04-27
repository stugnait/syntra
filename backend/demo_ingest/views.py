from __future__ import annotations

import json
from pathlib import Path

from django.db import DatabaseError
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import DemoAnalysisJob
from .services import AwpyUnavailableError, DemoDownloadError, analyze_demo_file, download_demo_file


@csrf_exempt
@require_POST
def upload_demo(request: HttpRequest) -> HttpResponse:
    demo_file = request.FILES.get("demo")
    if demo_file is None:
        return JsonResponse({"error": "No file provided. Use form-data key `demo`."}, status=400)

    lower_name = demo_file.name.lower()
    if not (lower_name.endswith(".dem") or lower_name.endswith(".dem.gz")):
        return JsonResponse({"error": "Only .dem and .dem.gz files are supported."}, status=400)

    sample_every = max(int(request.POST.get("sample_every", 8)), 1)

    try:
        job = DemoAnalysisJob.objects.create(
            original_filename=demo_file.name,
            demo_file=demo_file,
            status=DemoAnalysisJob.Status.PROCESSING,
        )
    except DatabaseError:
        return JsonResponse(
            {"error": "Database is unavailable. Check DATABASE_URL and run migrations."},
            status=503,
        )

    try:
        result = analyze_demo_file(job.demo_file.path, sample_every=sample_every)
        job.result = result
        job.status = DemoAnalysisJob.Status.COMPLETED
        job.error_message = ""
    except AwpyUnavailableError as exc:
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        job.status = DemoAnalysisJob.Status.FAILED
        job.error_message = f"Unexpected parser error: {exc}"
    job.save(update_fields=["result", "status", "error_message", "updated_at"])

    return JsonResponse(
        {
            "job_id": str(job.id),
            "status": job.status,
            "error_message": job.error_message,
        },
        status=201,
    )


@csrf_exempt
@require_POST
def import_demo_from_url(request: HttpRequest) -> HttpResponse:
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Body must be valid JSON."}, status=400)

    demo_url = str(payload.get("demo_url", "")).strip()
    sample_every = max(int(payload.get("sample_every", 8)), 1)
    if not demo_url:
        return JsonResponse({"error": "Field `demo_url` is required."}, status=400)

    demo_name = Path(demo_url).name or "remote_demo.dem"
    if not (demo_name.lower().endswith(".dem") or demo_name.lower().endswith(".dem.gz")):
        return JsonResponse({"error": "Remote demo URL must end with .dem or .dem.gz."}, status=400)

    try:
        job = DemoAnalysisJob.objects.create(
            original_filename=demo_name,
            status=DemoAnalysisJob.Status.PROCESSING,
        )
        job.demo_file.name = f"demos/{job.id}_{demo_name}"
        job.save(update_fields=["demo_file", "updated_at"])
    except DatabaseError:
        return JsonResponse(
            {"error": "Database is unavailable. Check DATABASE_URL and run migrations."},
            status=503,
        )

    try:
        temp_path = Path(job.demo_file.path)
        download_demo_file(demo_url, temp_path)

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

    return JsonResponse(
        {
            "job_id": str(job.id),
            "status": job.status,
            "error_message": job.error_message,
        },
        status=201,
    )


@require_GET
def demo_job_status(request: HttpRequest, job_id: str) -> HttpResponse:
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DatabaseError:
        return JsonResponse(
            {"error": "Database is unavailable. Check DATABASE_URL and run migrations."},
            status=503,
        )
    except DemoAnalysisJob.DoesNotExist:
        return JsonResponse({"error": "Job not found."}, status=404)

    return JsonResponse(
        {
            "job_id": str(job.id),
            "original_filename": job.original_filename,
            "status": job.status,
            "error_message": job.error_message,
            "result": job.result,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
        }
    )


@require_GET
def demo_job_radar(request: HttpRequest, job_id: str) -> HttpResponse:
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
    except DatabaseError:
        return JsonResponse(
            {"error": "Database is unavailable. Check DATABASE_URL and run migrations."},
            status=503,
        )
    except DemoAnalysisJob.DoesNotExist:
        return JsonResponse({"error": "Job not found."}, status=404)

    if job.status != DemoAnalysisJob.Status.COMPLETED:
        return JsonResponse(
            {"error": "Radar is available only for completed jobs.", "status": job.status},
            status=409,
        )

    radar = ((job.result or {}).get("analysis") or {}).get("radar")
    if not radar:
        return JsonResponse({"error": "No radar data found for this job."}, status=404)

    return JsonResponse(
        {
            "job_id": str(job.id),
            "original_filename": job.original_filename,
            "radar": radar,
        }
    )
