from django.urls import path

from .views import demo_job_radar, demo_job_status, import_demo_from_url, upload_demo

urlpatterns = [
    path("upload/", upload_demo, name="upload_demo"),
    path("import/", import_demo_from_url, name="import_demo_from_url"),
    path("jobs/<uuid:job_id>/", demo_job_status, name="demo_job_status"),
    path("jobs/<uuid:job_id>/radar/", demo_job_radar, name="demo_job_radar"),
]
