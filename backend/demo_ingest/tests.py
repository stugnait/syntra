import tempfile
from io import StringIO
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase
from django.test.utils import override_settings
from django.urls import reverse
from django.utils import timezone

from .models import DemoAnalysisJob


@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class DemoUploadTests(TestCase):
    @patch("demo_ingest.views.transaction.on_commit", side_effect=lambda fn: fn())
    @patch("demo_ingest.views.enqueue_upload_job")
    def test_upload_creates_pending_job_and_enqueues(self, mock_enqueue, _mock_on_commit):
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")

        response = self.client.post(reverse("upload_demo"), {"demo": upload, "sample_every": 4})

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        self.assertEqual(job.status, DemoAnalysisJob.Status.PENDING)
        self.assertEqual(job.original_filename, "match.dem")
        self.assertTrue(Path(job.demo_file.path).exists())
        self.assertIn(f"{job.id}_match.dem", Path(job.demo_file.name).name)
        mock_enqueue.assert_called_once_with(str(job.id), sample_every=4)

    @patch.dict("os.environ", {"DEMO_SAMPLE_EVERY": "64"})
    @patch("demo_ingest.views.transaction.on_commit", side_effect=lambda fn: fn())
    @patch("demo_ingest.views.enqueue_upload_job")
    def test_upload_default_sample_every_is_64(self, mock_enqueue, _mock_on_commit):
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")

        response = self.client.post(reverse("upload_demo"), {"demo": upload})

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        job = DemoAnalysisJob.objects.get(pk=payload["job_id"])
        mock_enqueue.assert_called_once_with(str(job.id), sample_every=64)

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

    def test_job_status_marks_stale_processing_job_as_failed(self):
        upload = SimpleUploadedFile("match.dem", b"demo-bytes")
        job = DemoAnalysisJob.objects.create(
            original_filename="match.dem",
            demo_file=upload,
            status=DemoAnalysisJob.Status.PROCESSING,
            result={"processing": {"stage": "parsing_demo", "progress": 40, "message": "Parsing demo with AWPY..."}},
        )
        DemoAnalysisJob.objects.filter(pk=job.pk).update(updated_at=timezone.now() - timezone.timedelta(minutes=20))

        with patch.dict("os.environ", {"DEMO_JOB_STALE_SECONDS": "60"}):
            status_response = self.client.get(reverse("demo_job_status", kwargs={"job_id": str(job.id)}))

        self.assertEqual(status_response.status_code, 200)
        payload = status_response.json()
        self.assertEqual(payload["status"], DemoAnalysisJob.Status.FAILED)
        self.assertIn("timed out", payload["error_message"])


class DemoImportTests(TestCase):
    @patch("demo_ingest.views.transaction.on_commit", side_effect=lambda fn: fn())
    @patch("demo_ingest.views.enqueue_import_job")
    def test_import_from_url_creates_pending_job(self, mock_enqueue, _mock_on_commit):
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
        response = self.client.post(reverse("import_demo_from_url"), data={}, content_type="application/json")
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
        self.damages = FakeFrame([{"attacker_name": "p1", "hp_damage": 60}])
        self.kills = FakeFrame([{"attacker_name": "p1", "victim_name": "p2", "is_headshot": True}])

    def parse(self):
        return None


class AwpyServiceTests(SimpleTestCase):
    @patch("demo_ingest.services.importlib.util.find_spec", return_value=object())
    @patch("demo_ingest.services.importlib.import_module")
    def test_analyze_demo_file_supports_awpy_demo_instance_api_and_no_full_parsed_dump(
        self,
        mock_import_module,
        _mock_find_spec,
    ):
        from demo_ingest import services

        mock_import_module.side_effect = lambda name: SimpleNamespace(Demo=FakeDemo) if name == "awpy" else None

        payload = services.analyze_demo_file("/tmp/demo.dem", sample_every=1)

        self.assertEqual(payload["analysis"]["engine"], "awpy.Demo")
        self.assertEqual(payload["analysis"]["radar"]["map"], "de_mirage")
        self.assertEqual(payload["analysis"]["metrics"]["player_stats"]["player"], "p1")
        self.assertNotIn("gameRounds", str(payload["analysis"]["parsed"]))
        self.assertIn("events_count", payload["analysis"]["parsed"])


@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class TaskExecutionTests(TestCase):
    @patch("demo_ingest.tasks._analyze_with_timeout", return_value={"analysis": {"radar": {}, "metrics": {}}})
    def test_run_upload_job_marks_completed_on_success(self, _mock_analyze):
        from demo_ingest import tasks

        upload = SimpleUploadedFile("ok.dem", b"bytes")
        job = DemoAnalysisJob.objects.create(original_filename="ok.dem", demo_file=upload, status=DemoAnalysisJob.Status.PENDING)

        tasks._run_upload_job(str(job.id), sample_every=64)
        job.refresh_from_db()

        self.assertEqual(job.status, DemoAnalysisJob.Status.COMPLETED)
        self.assertEqual(job.result.get("processing", {}).get("stage"), "completed")

    @patch("demo_ingest.tasks._analyze_with_timeout", side_effect=TimeoutError("Demo parsing timed out"))
    def test_run_upload_job_marks_failed_on_timeout(self, _mock_analyze):
        from demo_ingest import tasks

        upload = SimpleUploadedFile("timeout.dem", b"bytes")
        job = DemoAnalysisJob.objects.create(original_filename="timeout.dem", demo_file=upload, status=DemoAnalysisJob.Status.PENDING)

        tasks._run_upload_job(str(job.id), sample_every=64)
        job.refresh_from_db()

        self.assertEqual(job.status, DemoAnalysisJob.Status.FAILED)
        self.assertIn("timed out", job.error_message)


class TaskEnqueueTests(SimpleTestCase):
    @patch("demo_ingest.tasks.subprocess.Popen")
    def test_enqueue_upload_job_spawns_worker_process(self, mock_popen):
        from demo_ingest import tasks

        tasks.enqueue_upload_job("job-1", 64)
        cmd = mock_popen.call_args.args[0]
        self.assertIn("run_demo_job", cmd)
        self.assertIn("upload", cmd)

    @patch("demo_ingest.tasks.subprocess.Popen")
    def test_enqueue_import_job_spawns_worker_process(self, mock_popen):
        from demo_ingest import tasks

        tasks.enqueue_import_job("job-2", "https://example.com/test.dem", 64)
        cmd = mock_popen.call_args.args[0]
        self.assertIn("run_demo_job", cmd)
        self.assertIn("import", cmd)
        self.assertIn("--demo-url", cmd)


@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class FixDemoFilePathsCommandTests(TestCase):
    def test_command_fixes_missing_prefixed_paths_for_failed_jobs(self):
        existing = Path(tempfile.gettempdir()) / "demos" / "legacy-match.dem"
        existing.parent.mkdir(parents=True, exist_ok=True)
        existing.write_bytes(b"demo-bytes")

        job = DemoAnalysisJob.objects.create(
            original_filename="legacy-match.dem",
            demo_file="demos/11111111-1111-1111-1111-111111111111_legacy-match.dem",
            status=DemoAnalysisJob.Status.FAILED,
        )

        out = StringIO()
        call_command("fix_demo_file_paths", stdout=out)

        job.refresh_from_db()
        self.assertEqual(Path(job.demo_file.name).name, "legacy-match.dem")
        self.assertIn("[fixed]", out.getvalue())
