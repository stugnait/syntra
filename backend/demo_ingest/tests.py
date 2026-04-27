from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import DemoAnalysisJob


class DemoUploadTests(TestCase):
    @patch("demo_ingest.views.analyze_demo_file")
    def test_upload_creates_completed_job(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24, "radar": {"frames": []}, "metrics": {"map": "de_mirage", "rounds": 24, "score": {"ct": 13, "t": 9}, "player_stats": {"kills": 20}}}}
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
    def test_report_endpoint_returns_metrics_payload(self, mock_analyze):
        mock_analyze.return_value = {
            "analysis": {
                "radar": {"frames": []},
                "metrics": {
                    "map": "de_mirage",
                    "rounds": 22,
                    "score": {"ct": 13, "t": 9, "result": "ct_win"},
                    "player_stats": {"player": "tester", "kills": 22, "deaths": 15},
                    "round_timeline": [{"round": 1, "winner_side": "CT"}],
                },
            }
        }
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")
        create_response = self.client.post(reverse("upload_demo"), {"demo": upload})

        job_id = create_response.json()["job_id"]
        report_response = self.client.get(reverse("demo_job_report", kwargs={"job_id": job_id}))

        self.assertEqual(report_response.status_code, 200)
        payload = report_response.json()["report"]
        self.assertEqual(payload["map"], "de_mirage")
        self.assertEqual(payload["player_stats"]["kills"], 22)

    @patch("demo_ingest.views.analyze_demo_file")
    def test_job_status_endpoint_returns_payload(self, mock_analyze):
        mock_analyze.return_value = {"analysis": {"rounds": 24, "radar": {"frames": []}, "metrics": {"map": "de_mirage", "rounds": 24, "score": {"ct": 13, "t": 9}, "player_stats": {"kills": 20}}}}
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
