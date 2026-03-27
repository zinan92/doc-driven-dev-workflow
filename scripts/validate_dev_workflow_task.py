#!/usr/bin/env python3
"""Validate a document-driven development task directory."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from workflow_guard import detect_template


REQUIRED_FILES = [
    "status.md",
    "decision-log.md",
    "handoffs/00-intake.md",
    "handoffs/09-product-research.md",
    "handoffs/09-reference-evidence.md",
    "handoffs/10-prd.md",
    "handoffs/20-user-flow.md",
    "handoffs/21-user-flow.yaml",
    "handoffs/22-prototype-brief.md",
    "handoffs/30-implementation-plan.md",
    "handoffs/40-execution-prompt.md",
    "handoffs/96-release-package.md",
    "handoffs/97-delivery-approval.md",
    "handoffs/100-backlog-and-debt.md",
    "system/state.json",
]

STATUS_REQUIRED_LINES = [
    "- Current stage:",
    "- Current owner:",
    "- Current round or batch:",
    "- Latest conclusion:",
    "- Blockers:",
    "- Next step:",
]

REQUIRED_FRONTMATTER_FILES = [
    "handoffs/00-intake.md",
    "handoffs/09-product-research.md",
    "handoffs/10-prd.md",
    "handoffs/20-user-flow.md",
    "handoffs/25-human-approval.md",
    "handoffs/40-execution-prompt.md",
    "handoffs/97-delivery-approval.md",
]

REQUIRED_SECTIONS = {
    "handoffs/40-execution-prompt.md": [
        "## Repository",
        "## Source of Truth",
        "## Execution Rules",
        "## Stop Conditions",
        "## Required Report Format",
        "## Forbidden Behavior",
    ],
    "handoffs/60-codex-review-r1.md": [
        "## Summary",
        "## Findings",
        "## Required Changes",
        "## Gate Decision",
    ],
    "handoffs/80-codex-review-r2.md": [
        "## Summary",
        "## Findings",
        "## Final Required Changes",
        "## Gate Decision",
    ],
}


def has_frontmatter(text: str) -> bool:
    return text.startswith("---\n") and "\n---\n" in text[4:]


def validate_required_sections(path: Path, sections: list[str]) -> list[str]:
    text = path.read_text()
    errors: list[str] = []
    for section in sections:
        if section not in text:
            errors.append(f"Missing required section in {path.name}: {section}")
    return errors


def validate_user_flow_yaml(path: Path) -> list[str]:
    text = path.read_text()
    errors: list[str] = []
    if "steps:" not in text:
        errors.append("Missing steps block in handoffs/21-user-flow.yaml")
    if "failure:" not in text:
        errors.append("Missing failure contract in handoffs/21-user-flow.yaml")
    return errors


def validate_task(task_dir: Path) -> dict[str, object]:
    errors: list[str] = []
    warnings: list[str] = []

    if not task_dir.exists():
        return {"ok": False, "errors": [f"Task directory does not exist: {task_dir}"], "warnings": warnings}

    for rel_path in REQUIRED_FILES:
        path = task_dir / rel_path
        if not path.exists():
            errors.append(f"Missing required file: {rel_path}")

    status_path = task_dir / "status.md"
    if status_path.exists():
        status_text = status_path.read_text()
        for expected in STATUS_REQUIRED_LINES:
            if expected not in status_text:
                errors.append(f"Missing required status summary line in status.md: {expected}")

    for rel_path in REQUIRED_FRONTMATTER_FILES:
        path = task_dir / rel_path
        if path.exists() and not has_frontmatter(path.read_text()):
            errors.append(f"Missing or invalid frontmatter in {rel_path}")

    for rel_path, sections in REQUIRED_SECTIONS.items():
        path = task_dir / rel_path
        if path.exists():
            errors.extend(validate_required_sections(path, sections))

    user_flow_yaml_path = task_dir / "handoffs" / "21-user-flow.yaml"
    if user_flow_yaml_path.exists():
        errors.extend(validate_user_flow_yaml(user_flow_yaml_path))

    state_path = task_dir / "system" / "state.json"
    if state_path.exists():
        try:
            state = json.loads(state_path.read_text())
        except json.JSONDecodeError as exc:
            errors.append(f"Invalid JSON in system/state.json: {exc}")
        else:
            for key in ["task_id", "status", "stage", "current_actor"]:
                if key not in state:
                    errors.append(f"Missing key in system/state.json: {key}")

    # Template detection
    handoffs_dir = task_dir / "handoffs"
    if handoffs_dir.exists():
        for handoff in sorted(handoffs_dir.iterdir()):
            if handoff.suffix in (".md", ".yaml") and handoff.is_file():
                content = handoff.read_text()
                if detect_template(content):
                    warnings.append(f"Template placeholders detected in {handoff.name}")

    return {"ok": not errors, "errors": errors, "warnings": warnings}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_dir", help="Path to the task directory")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = validate_task(Path(args.task_dir))
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
