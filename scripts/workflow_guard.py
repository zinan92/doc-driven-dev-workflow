"""Pure-function enforcement guards for the doc-driven development workflow.

All guards either return None (pass) or raise GuardError (fail).
No side effects. No file writes. Just validation.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


class GuardError(Exception):
    """Raised when a workflow guard check fails."""


def load_canonical_workflow(
    path: Path | None = None,
) -> dict[str, Any]:
    """Load and index the canonical workflow definition from JSON."""
    if path is None:
        path = Path(__file__).resolve().parent.parent / "docs" / "canonical-workflow.json"

    raw = json.loads(path.read_text())
    stages_by_id: dict[str, dict[str, Any]] = {}
    for stage in raw.get("stages", []):
        stages_by_id[stage["id"]] = stage

    return {
        "stages": stages_by_id,
        "stages_ordered": [s["id"] for s in raw.get("stages", [])],
        "round_limits": raw.get("round_limits", {}),
        "template_markers": raw.get("template_markers", []),
    }


def validate_transition(
    workflow: dict[str, Any],
    current_stage: str,
    target_stage: str,
) -> None:
    stage_def = workflow["stages"].get(current_stage)
    if stage_def is None:
        raise GuardError(f"Unknown current stage: {current_stage}")

    allowed_next = stage_def.get("next", [])
    if target_stage not in allowed_next:
        raise GuardError(
            f"Cannot advance from '{current_stage}' to '{target_stage}': "
            f"not in allowed next stages {allowed_next}"
        )


def validate_actor(
    workflow: dict[str, Any],
    stage_id: str,
    actor: str,
) -> None:
    stage_def = workflow["stages"].get(stage_id)
    if stage_def is None:
        raise GuardError(f"Unknown stage: {stage_id}")

    expected_actor = stage_def.get("actor")
    if expected_actor and actor != expected_actor:
        raise GuardError(
            f"Stage '{stage_id}' requires actor '{expected_actor}', got '{actor}'"
        )


def check_prerequisites(
    workflow: dict[str, Any],
    stage_id: str,
    task_dir: Path,
) -> None:
    stage_def = workflow["stages"].get(stage_id)
    if stage_def is None:
        raise GuardError(f"Unknown stage: {stage_id}")

    markers = workflow.get("template_markers", [])

    for inp in stage_def.get("inputs", []):
        inp_path = inp.get("path", "") if isinstance(inp, dict) else inp
        if "{round}" in inp_path:
            continue

        full_path = task_dir / inp_path
        if not full_path.exists():
            raise GuardError(f"Missing required input: {inp_path}")

        content = full_path.read_text()
        if detect_template(content, markers):
            raise GuardError(
                f"Input '{inp_path}' is still a template (contains unfilled placeholders)"
            )


_DEFAULT_MARKERS = [
    "{{TASK_ID}}", "{{DATE}}", "{{SHORT_NAME}}", "{{FEATURE_NAME}}",
    "{{REPO_PATH}}", "<!-- TODO", "_Replace this",
]


def detect_template(
    content: str,
    markers: list[str] | None = None,
) -> bool:
    if markers is None:
        markers = _DEFAULT_MARKERS
    for marker in markers:
        if marker in content:
            return True
    if re.search(r"\{\{[A-Z_]+\}\}", content):
        return True
    return False


def check_human_gate(approval_path: Path) -> None:
    if not approval_path.exists():
        raise GuardError("Human approval required: handoffs/25-human-approval.md does not exist")

    content = approval_path.read_text()
    fm = _extract_frontmatter(content)
    author = fm.get("author", "")
    status = fm.get("status", "")

    if author != "human" or status != "approved":
        raise GuardError(
            f"Human approval required: author='{author}', status='{status}'. "
            f"Both must be author='human' and status='approved'."
        )


def _extract_frontmatter(content: str) -> dict[str, str]:
    result: dict[str, str] = {}
    lines = content.strip().splitlines()
    if not lines or lines[0].strip() != "---":
        return result
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" in line:
            key, _, value = line.partition(":")
            result[key.strip()] = value.strip().strip('"').strip("'")
    return result


def check_round_limit(
    workflow: dict[str, Any],
    task_size: str,
    current_round: int,
    stage: str,
) -> None:
    limits = workflow.get("round_limits", {}).get(task_size, {})
    if not limits:
        return

    if stage in ("codex_reviews_batch", "claude_code_batch_execution"):
        max_rounds = limits.get("max_review_rounds", 99)
        if current_round > max_rounds:
            raise GuardError(
                f"Round limit exceeded: task_size='{task_size}', "
                f"current_round={current_round}, max={max_rounds}"
            )


def validate_event_consistency(
    event: str,
    event_stage: str | None,
    current_state: dict[str, Any],
) -> None:
    current_stage = current_state.get("stage", "")

    if event == "stage_completed" and event_stage and event_stage != current_stage:
        raise GuardError(
            f"Cannot log stage_completed for '{event_stage}': "
            f"current stage is '{current_stage}'"
        )

    if event == "task_completed" and current_state.get("status") != "done":
        raise GuardError(
            "Cannot log task_completed: task status is not 'done'. "
            "Update state to done first via update_task_state.py."
        )


def guard_transition(
    workflow: dict[str, Any],
    task_dir: Path,
    current_stage: str,
    target_stage: str,
    actor: str,
    task_size: str | None = None,
    current_round: int = 0,
) -> list[str]:
    errors: list[str] = []

    try:
        validate_transition(workflow, current_stage, target_stage)
    except GuardError as e:
        errors.append(str(e))

    try:
        validate_actor(workflow, current_stage, actor)
    except GuardError as e:
        errors.append(f"Current stage actor mismatch: {e}")

    try:
        validate_actor(workflow, target_stage, actor)
    except GuardError as e:
        errors.append(str(e))

    try:
        check_prerequisites(workflow, target_stage, task_dir)
    except GuardError as e:
        errors.append(str(e))

    if target_stage == "draft_implementation_plan":
        try:
            approval_path = task_dir / "handoffs" / "25-human-approval.md"
            check_human_gate(approval_path)
        except GuardError as e:
            errors.append(str(e))

    if task_size:
        try:
            check_round_limit(workflow, task_size, current_round, target_stage)
        except GuardError as e:
            errors.append(str(e))

    return errors
