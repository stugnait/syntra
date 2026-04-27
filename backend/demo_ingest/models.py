import os
import uuid
from pathlib import Path

from django.db import models


def demo_upload_to(instance: "DemoAnalysisJob", filename: str) -> str:
    safe_name = Path(filename).name or "demo.dem"
    return f"demos/{instance.id}_{safe_name}"


class DemoAnalysisJob(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_filename = models.CharField(max_length=255)
    demo_file = models.FileField(upload_to=demo_upload_to)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    result = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def build_demo_storage_name(self, filename: str) -> str:
        return demo_upload_to(self, filename)

    @property
    def demo_file_size(self) -> int | None:
        try:
            return os.path.getsize(self.demo_file.path)
        except OSError:
            return None

    def __str__(self) -> str:
        return f"{self.original_filename} ({self.status})"
