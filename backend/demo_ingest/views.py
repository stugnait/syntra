from __future__ import annotations

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import DemoAnalysisJob
from .services import AwpyUnavailableError, analyze_demo_file


@csrf_exempt
@require_POST
def upload_demo(request: HttpRequest) -> HttpResponse:
    demo_file = request.FILES.get("demo")
    if demo_file is None:
        return JsonResponse({"error": "No file provided. Use form-data key `demo`."}, status=400)

    if not demo_file.name.lower().endswith(".dem"):
        return JsonResponse({"error": "Only .dem files are supported."}, status=400)

    job = DemoAnalysisJob.objects.create(
        original_filename=demo_file.name,
        demo_file=demo_file,
        status=DemoAnalysisJob.Status.PROCESSING,
    )

    try:
        result = analyze_demo_file(job.demo_file.path)
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


@require_GET
def demo_job_status(request: HttpRequest, job_id: str) -> HttpResponse:
    try:
        job = DemoAnalysisJob.objects.get(pk=job_id)
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
