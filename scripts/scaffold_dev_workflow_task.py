#!/usr/bin/env python3
"""Scaffold a new document-driven development task directory."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TEMPLATE_ROOT = ROOT / "docs" / "templates" / "development-workflow" / "task-root"
DEFAULT_OUTPUT_ROOT = ROOT / "tasks"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-")


def make_task_id(*, feature_name: str, current_date: str | None = None) -> str:
    current_date = current_date or date.today().isoformat()
    return f"TASK-{current_date}-{slugify(feature_name) or 'task'}"


def build_replacements(task_id: str, feature_name: str, repo_path: str, current_date: str) -> dict[str, str]:
    short_name = slugify(feature_name) or slugify(task_id) or "task"
    return {
        "{{TASK_ID}}": task_id,
        "{{DATE}}": current_date,
        "{{SHORT_NAME}}": short_name,
        "{{FEATURE_NAME}}": feature_name,
        "{{REPO_PATH}}": repo_path,
        "{{WORK_BRANCH}}": f"task/{short_name}",
    }


def replace_placeholders(root: Path, replacements: dict[str, str]) -> None:
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        text = path.read_text()
        for placeholder, value in replacements.items():
            text = text.replace(placeholder, value)
        path.write_text(text)


def scaffold_task(
    *,
    task_id: str | None,
    feature_name: str,
    repo_path: str,
    output_root: Path = DEFAULT_OUTPUT_ROOT,
    template_root: Path = DEFAULT_TEMPLATE_ROOT,
    current_date: str | None = None,
    force: bool = False,
) -> Path:
    if not template_root.exists():
        raise FileNotFoundError(f"Template root does not exist: {template_root}")

    current_date = current_date or date.today().isoformat()
    task_id = task_id or make_task_id(feature_name=feature_name, current_date=current_date)
    output_root.mkdir(parents=True, exist_ok=True)
    task_dir = output_root / task_id

    if task_dir.exists():
        if not force:
            raise FileExistsError(f"Task directory already exists: {task_dir}")
        shutil.rmtree(task_dir)

    shutil.copytree(template_root, task_dir)
    replace_placeholders(
        task_dir,
        build_replacements(
            task_id=task_id,
            feature_name=feature_name,
            repo_path=repo_path,
            current_date=current_date,
        ),
    )

    system_dir = task_dir / "system"
    state = json.loads((system_dir / "state.json").read_text())
    (system_dir / "run-log.jsonl").write_text(
        json.dumps(
            {
                "timestamp": f"{current_date}T00:00:00Z",
                "event": "task_created",
                "task_id": state["task_id"],
                "phase": state.get("current_phase", "intention_framing"),
                "stage": state["stage"],
                "actor": state["current_actor"],
                "artifact": state["last_artifact"],
                "status": state["status"],
                "round": state["round"],
            }
        )
        + "\n"
    )
    (system_dir / "lock").touch()
    return task_dir


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--task-id",
        required=False,
        help="Optional task identifier. If omitted, one is generated from the current date and name.",
    )
    parser.add_argument("--name", required=True, help="Human-readable feature or task name")
    parser.add_argument("--repo-path", required=True, help="Target repository path for the task")
    parser.add_argument(
        "--output-root",
        default=str(DEFAULT_OUTPUT_ROOT),
        help=f"Directory that will contain task folders (default: {DEFAULT_OUTPUT_ROOT})",
    )
    parser.add_argument(
        "--template-root",
        default=str(DEFAULT_TEMPLATE_ROOT),
        help=f"Template directory to copy from (default: {DEFAULT_TEMPLATE_ROOT})",
    )
    parser.add_argument("--date", default=None, help="Override ISO date used in placeholders")
    parser.add_argument("--force", action="store_true", help="Overwrite the destination task directory if it exists")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    task_dir = scaffold_task(
        task_id=args.task_id,
        feature_name=args.name,
        repo_path=args.repo_path,
        output_root=Path(args.output_root),
        template_root=Path(args.template_root),
        current_date=args.date,
        force=args.force,
    )
    print(task_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
