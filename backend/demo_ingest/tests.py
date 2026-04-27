from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import DemoAnalysisJob


class DemoUploadTests(TestCase):
    @patch("demo_ingest.views.enqueue_upload_job")
    def test_upload_creates_pending_job_and_enqueues(self, mock_enqueue):
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")

        response = self.client.post(reverse("upload_demo"), {"demo": upload, "sample_every": 4})

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.PENDING)
        mock_enqueue.assert_called_once_with(str(job.id), sample_every=4)

    def test_upload_requires_file(self):
        response = self.client.post(reverse("upload_demo"), {})
        self.assertEqual(response.status_code, 400)

    def test_upload_rejects_non_dem_extension(self):
        upload = SimpleUploadedFile("notes.txt", b"demo-bytes")
        response = self.client.post(reverse("upload_demo"), {"demo": upload})
        self.assertEqual(response.status_code, 400)

    def test_job_status_endpoint_returns_payload(self):
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")
        create_response = self.client.post(reverse("upload_demo"), {"demo": upload})

        job_id = create_response.json()["job_id"]
        status_response = self.client.get(reverse("demo_job_status", kwargs={"job_id": job_id}))

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.json()["job_id"], job_id)


class DemoImportTests(TestCase):
    @patch("demo_ingest.views.enqueue_import_job")
    def test_import_from_url_creates_pending_job(self, mock_enqueue):
        response = self.client.post(
            reverse("import_demo_from_url"),
            data={"demo_url": "https://cdn.example.com/final.dem", "sample_every": 2},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.PENDING)
        mock_enqueue.assert_called_once_with(str(job.id), demo_url="https://cdn.example.com/final.dem", sample_every=2)

    def test_import_requires_demo_url(self):
        response = self.client.post(
            reverse("import_demo_from_url"),
            data={},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class FakeFrame:
    def __init__(self, rows):
        self._rows = rows

    def to_dicts(self):
        return self._rows


class FakeDemo:
    def __init__(self, path):
        self.path = path
        self.header = {"map_name": "de_mirage"}
        self.detected_events = ["player_death"]
        self.rounds = FakeFrame([
            {"round_num": 1, "winner": "ct", "ct_score": 1, "t_score": 0},
            {"round_num": 2, "winner": "t", "ct_score": 1, "t_score": 1},
        ])
        self.ticks = FakeFrame([
            {"tick": 64, "name": "p1", "side": "ct", "x": 1.0, "y": 2.0, "z": 3.0, "health": 100, "armor_value": 50},
            {"tick": 128, "name": "p2", "side": "t", "x": 4.0, "y": 5.0, "z": 6.0, "health": 90, "armor_value": 0},
        ])
        self.damages = FakeFrame([
            {"attacker_name": "p1", "hp_damage": 40},
            {"attacker_name": "p1", "hp_damage": 20},
        ])

    def parse(self):
        return None


class AwpyServiceTests(SimpleTestCase):
    @patch("demo_ingest.services.importlib.util.find_spec", return_value=object())
    @patch("demo_ingest.services.importlib.import_module")
    def test_analyze_demo_file_supports_awpy_demo_instance_api(self, mock_import_module, _mock_find_spec):
        from demo_ingest import services

        mock_import_module.side_effect = lambda name: SimpleNamespace(Demo=FakeDemo) if name == "awpy" else None

        payload = services.analyze_demo_file("/tmp/demo.dem", sample_every=1)

        self.assertEqual(payload["analysis"]["engine"], "awpy.Demo")
        self.assertEqual(payload["analysis"]["radar"]["map"], "de_mirage")
        self.assertEqual(payload["analysis"]["metrics"]["player_stats"]["player"], "p1")
