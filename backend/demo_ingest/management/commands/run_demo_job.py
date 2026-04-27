from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from demo_ingest.tasks import _run_import_job, _run_upload_job


class Command(BaseCommand):
    help = "Run a single demo ingest job in a dedicated process."

    def add_arguments(self, parser):
        parser.add_argument("--mode", choices=["upload", "import"], required=True)
        parser.add_argument("--job-id", required=True)
        parser.add_argument("--sample-every", type=int, default=64)
        parser.add_argument("--demo-url")

    def handle(self, *args, **options):
        mode = options["mode"]
        job_id = options["job_id"]
        sample_every = options["sample_every"]
        demo_url = options.get("demo_url")

        if mode == "upload":
            _run_upload_job(job_id, sample_every=sample_every)
            return

        if not demo_url:
            raise CommandError("--demo-url is required for import mode.")

        _run_import_job(job_id, demo_url=demo_url, sample_every=sample_every)
