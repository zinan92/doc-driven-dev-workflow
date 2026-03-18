"""Tests for workflow enforcement guards."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from workflow_guard import (
    load_canonical_workflow,
    validate_transition,
    validate_actor,
    check_prerequisites,
    detect_template,
    check_human_gate,
    check_round_limit,
    guard_transition,
    validate_event_consistency,
    GuardError,
)


class TestTransitionValidation:
    def test_valid_forward_transition(self, workflow):
        assert validate_transition(workflow, "clarify_objective", "classify_task") is None

    def test_invalid_skip_transition(self, workflow):
        with pytest.raises(GuardError, match="not in allowed next stages"):
            validate_transition(workflow, "clarify_objective", "draft_prd")

    def test_skip_to_execution(self, workflow):
        with pytest.raises(GuardError, match="not in allowed next stages"):
            validate_transition(workflow, "clarify_objective", "claude_code_batch_execution")

    def test_unknown_current_stage(self, workflow):
        with pytest.raises(GuardError, match="Unknown current stage"):
            validate_transition(workflow, "nonexistent_stage", "classify_task")


class TestActorValidation:
    def test_correct_actor(self, workflow):
        assert validate_actor(workflow, "clarify_objective", "codex") is None

    def test_wrong_actor_for_codex_stage(self, workflow):
        with pytest.raises(GuardError, match="requires actor"):
            validate_actor(workflow, "clarify_objective", "claude_code")

    def test_human_gate_rejects_codex(self, workflow):
        with pytest.raises(GuardError, match="requires actor"):
            validate_actor(workflow, "human_approval_gate", "codex")

    def test_claude_code_owns_batch_execution(self, workflow):
        assert validate_actor(workflow, "claude_code_batch_execution", "claude_code") is None


class TestPrerequisites:
    def test_met(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: TEST\n---\n## Objective\nReal objective here\n"
        )
        assert check_prerequisites(workflow, "classify_task", task_dir) is None

    def test_missing_file(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        with pytest.raises(GuardError, match="Missing required input"):
            check_prerequisites(workflow, "classify_task", task_dir)

    def test_template_detected(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: {{TASK_ID}}\n---\n## Objective\n{{PURPOSE}}\n"
        )
        with pytest.raises(GuardError, match="still a template"):
            check_prerequisites(workflow, "classify_task", task_dir)

    def test_no_inputs_always_passes(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        assert check_prerequisites(workflow, "clarify_objective", task_dir) is None


class TestTemplateDetection:
    def test_filled_file(self):
        assert detect_template("## Objective\nBuild a CLI tool") is False

    def test_placeholder(self):
        assert detect_template("## Objective\n{{PURPOSE}}") is True

    def test_todo_marker(self):
        assert detect_template("## Objective\n<!-- TODO: fill this -->") is True

    def test_custom_placeholder(self):
        assert detect_template("Hello {{CUSTOM_VAR}} world") is True


class TestHumanGate:
    def test_approved(self, tmp_path):
        approval = tmp_path / "25-human-approval.md"
        approval.write_text("---\nauthor: human\nstatus: approved\n---\n## Decision\nApproved.\n")
        assert check_human_gate(approval) is None

    def test_pending(self, tmp_path):
        approval = tmp_path / "25-human-approval.md"
        approval.write_text("---\nauthor: codex\nstatus: pending\n---\n## Decision\nPending.\n")
        with pytest.raises(GuardError, match="Human approval required"):
            check_human_gate(approval)

    def test_codex_self_approved(self, tmp_path):
        approval = tmp_path / "25-human-approval.md"
        approval.write_text("---\nauthor: codex\nstatus: approved\n---\n## Decision\nApproved.\n")
        with pytest.raises(GuardError, match="Human approval required"):
            check_human_gate(approval)

    def test_missing_file(self, tmp_path):
        approval = tmp_path / "25-human-approval.md"
        with pytest.raises(GuardError, match="does not exist"):
            check_human_gate(approval)


class TestRoundLimits:
    def test_within_limit(self, workflow):
        assert check_round_limit(workflow, "small", 2, "codex_reviews_batch") is None

    def test_exceeds_limit(self, workflow):
        with pytest.raises(GuardError, match="Round limit"):
            check_round_limit(workflow, "small", 3, "codex_reviews_batch")

    def test_no_limit_for_unknown_size(self, workflow):
        assert check_round_limit(workflow, "unknown", 99, "codex_reviews_batch") is None


class TestEventConsistency:
    def test_valid_stage_completed(self):
        state = {"stage": "draft_prd", "status": "active"}
        assert validate_event_consistency("stage_completed", "draft_prd", state) is None

    def test_false_stage_completed(self):
        state = {"stage": "clarify_objective", "status": "active"}
        with pytest.raises(GuardError, match="Cannot log stage_completed"):
            validate_event_consistency("stage_completed", "draft_prd", state)

    def test_task_completed_without_done_status(self):
        state = {"stage": "next_cycle", "status": "active"}
        with pytest.raises(GuardError, match="Cannot log task_completed"):
            validate_event_consistency("task_completed", None, state)


class TestGuardTransitionHappyPath:
    def test_valid_transition_returns_no_errors(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: TEST\n---\n## Objective\nReal content\n"
        )
        errors = guard_transition(
            workflow, task_dir,
            current_stage="clarify_objective",
            target_stage="classify_task",
            actor="codex",
        )
        assert errors == []

    def test_invalid_transition_returns_errors(self, workflow, tmp_path):
        task_dir = tmp_path / "task"
        task_dir.mkdir()
        (task_dir / "handoffs").mkdir()
        errors = guard_transition(
            workflow, task_dir,
            current_stage="clarify_objective",
            target_stage="draft_prd",
            actor="claude_code",
        )
        assert len(errors) >= 2  # transition error + actor error
