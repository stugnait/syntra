from pathlib import Path
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from .models import DemoAnalysisJob


class DemoUploadTests(TestCase):
    @patch("demo_ingest.views.analyze_demo_file")
    def test_upload_creates_completed_job(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24, "radar": {"frames": []}}}
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")

        response = self.client.post(reverse("upload_demo"), {"demo": upload, "sample_every": 4})

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.COMPLETED)
        mock_analyze.assert_called_once_with(job.demo_file.path, sample_every=4)

    def test_upload_requires_file(self):
        response = self.client.post(reverse("upload_demo"), {})
        self.assertEqual(response.status_code, 400)

    def test_upload_rejects_non_dem_extension(self):
        upload = SimpleUploadedFile("notes.txt", b"demo-bytes")
        response = self.client.post(reverse("upload_demo"), {"demo": upload})
        self.assertEqual(response.status_code, 400)

    @patch("demo_ingest.views.analyze_demo_file")
    def test_job_status_endpoint_returns_payload(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24, "radar": {"frames": []}}}
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")
        create_response = self.client.post(reverse("upload_demo"), {"demo": upload})

        job_id = create_response.json()["job_id"]
        status_response = self.client.get(reverse("demo_job_status", kwargs={"job_id": job_id}))

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()["job_id"], job_id)


class DemoImportTests(TestCase):
    @patch("demo_ingest.views.analyze_demo_file")
    @patch("demo_ingest.views.download_demo_file")
    def test_import_from_url_creates_job(self, mock_download, mock_analyze):
        mock_download.side_effect = lambda url, path: Path(path).write_bytes(b"demo")
        mock_analyze.return_value = {
            "analysis": {"radar": {"frames": [{"tick": 64, "players": []}]}}
        }

        response = self.client.post(
            reverse("import_demo_from_url"),
            data={"demo_url": "https://cdn.example.com/final.dem", "sample_every": 2},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.COMPLETED)

        radar_response = self.client.get(reverse("demo_job_radar", kwargs={"job_id": payload["job_id"]}))
        self.assertEqual(radar_response.status_code, 200)
        self.assertEqual(radar_response.json()["radar"]["frames"][0]["tick"], 64)

    def test_import_requires_demo_url(self):
        response = self.client.post(
            reverse("import_demo_from_url"),
            data={},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
