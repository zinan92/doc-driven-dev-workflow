"""Shared pytest fixtures for workflow enforcement tests."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from workflow_guard import load_canonical_workflow


@pytest.fixture
def workflow():
    """Load the canonical workflow definition."""
    return load_canonical_workflow()


@pytest.fixture
def scaffolded_task(tmp_path):
    """Create a minimal valid task directory at clarify_objective stage."""
    task_dir = tmp_path / "TASK-2026-01-01-test"
    task_dir.mkdir()
    (task_dir / "handoffs").mkdir()
    (task_dir / "system").mkdir()

    state = {
        "task_id": "TASK-2026-01-01-test",
        "status": "active",
        "current_phase": "intention_framing",
        "stage": "clarify_objective",
        "round": 0,
        "current_actor": "codex",
        "last_artifact": "handoffs/00-intake.md",
        "updated_at": None,
        "stop_reason": None,
    }
    (task_dir / "system" / "state.json").write_text(json.dumps(state, indent=2) + "\n")
    (task_dir / "system" / "run-log.jsonl").write_text("")
    (task_dir / "system" / "lock").write_text("")
    (task_dir / "status.md").write_text(
        "# Status\n\nCurrent stage: clarify_objective\nCurrent owner: codex\n"
        "Current round: 0\nLatest conclusion: none\nBlockers: none\nNext step: classify task\n"
    )
    (task_dir / "decision-log.md").write_text("# Decision Log\n")

    return task_dir
