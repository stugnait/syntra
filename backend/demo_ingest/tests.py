from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from .models import DemoAnalysisJob


class DemoUploadTests(TestCase):
    @patch("demo_ingest.views.analyze_demo_file")
    def test_upload_creates_completed_job(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24}}
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")

        response = self.client.post(reverse("upload_demo"), {"demo": upload})

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.COMPLETED)

    def test_upload_requires_file(self):
        response = self.client.post(reverse("upload_demo"), {})
        self.assertEqual(response.status_code, 400)

    def test_upload_rejects_non_dem_extension(self):
        upload = SimpleUploadedFile("notes.txt", b"demo-bytes")
        response = self.client.post(reverse("upload_demo"), {"demo": upload})
        self.assertEqual(response.status_code, 400)

    @patch("demo_ingest.views.analyze_demo_file")
    def test_job_status_endpoint_returns_payload(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24}}
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")
        create_response = self.client.post(reverse("upload_demo"), {"demo": upload})

        job_id = create_response.json()["job_id"]
        status_response = self.client.get(reverse("demo_job_status", kwargs={"job_id": job_id}))

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()["job_id"], job_id)
