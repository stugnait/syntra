from django.urls import path

from .views import demo_job_status, upload_demo

urlpatterns = [
    path("upload/", upload_demo, name="upload_demo"),
    path("jobs/<uuid:job_id>/", demo_job_status, name="demo_job_status"),
]
