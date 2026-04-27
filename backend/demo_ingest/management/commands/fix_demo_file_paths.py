from __future__ import annotations

from pathlib import Path

from django.core.management.base import BaseCommand
from django.db.models import Q

from demo_ingest.models import DemoAnalysisJob
from demo_ingest.tasks import _recover_missing_demo_path


class Command(BaseCommand):
    help = "Fix broken demo_file paths for pending/failed demo ingest jobs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be fixed without persisting changes.",
        )

    def handle(self, *args, **options):
        dry_run = bool(options["dry_run"])
        queryset = DemoAnalysisJob.objects.filter(
            Q(status=DemoAnalysisJob.Status.PENDING) | Q(status=DemoAnalysisJob.Status.FAILED)
        ).order_by("created_at")

        scanned = 0
        fixed = 0
        skipped = 0

        for job in queryset.iterator():
            scanned += 1
            current_path = Path(job.demo_file.path)
            if current_path.exists():
                skipped += 1
                continue

            before_name = job.demo_file.name
            try:
                recovered = _recover_missing_demo_path(job)
            except FileNotFoundError:
                skipped += 1
                self.stdout.write(
                    self.style.WARNING(f"[skip] {job.id} missing and no candidate found: {before_name}")
                )
                continue

            if dry_run:
                job.demo_file.name = before_name
                job.save(update_fields=["demo_file", "updated_at"])

            fixed += 1
            self.stdout.write(
                self.style.SUCCESS(f"[fixed] {job.id} {before_name} -> {job.demo_file.name} ({recovered})")
            )

        mode = "dry-run" if dry_run else "apply"
        self.stdout.write(self.style.SUCCESS(f"Done ({mode}). scanned={scanned}, fixed={fixed}, skipped={skipped}."))
