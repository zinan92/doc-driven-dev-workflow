import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCAFFOLD_SCRIPT = ROOT / "scripts" / "scaffold_dev_workflow_task.py"
VALIDATE_SCRIPT = ROOT / "scripts" / "validate_dev_workflow_task.py"
NEXT_STEP_SCRIPT = ROOT / "scripts" / "dev_workflow_next_step.py"
UPDATE_STATE_SCRIPT = ROOT / "scripts" / "update_task_state.py"
APPEND_EVENT_SCRIPT = ROOT / "scripts" / "append_task_event.py"
TEMPLATE_ROOT = ROOT / "docs" / "templates" / "development-workflow" / "task-root"


def load_module(path: Path, module_name: str):
    if not path.exists():
        raise FileNotFoundError(f"Missing script: {path}")
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class DevWorkflowHelperTests(unittest.TestCase):
    def setUp(self):
        self.scaffold = load_module(SCAFFOLD_SCRIPT, "scaffold_dev_workflow_task")

    def make_task(self, stage: str = "intake", status: str = "active"):
        tmpdir = tempfile.TemporaryDirectory()
        output_root = Path(tmpdir.name) / "tasks"
        task_dir = self.scaffold.scaffold_task(
            task_id="TASK-2026-03-15-helper-demo",
            feature_name="helper-demo",
            repo_path="/tmp/example-repo",
            output_root=output_root,
            template_root=TEMPLATE_ROOT,
            current_date="2026-03-15",
        )
        state_path = task_dir / "system" / "state.json"
        state = json.loads(state_path.read_text())
        state["stage"] = stage
        state["status"] = status
        state_path.write_text(json.dumps(state, indent=2) + "\n")
        return tmpdir, task_dir

    def test_validate_task_reports_success_for_scaffolded_task(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["errors"], [])

    def test_validate_task_reports_missing_required_files(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)
        (task_dir / "status.md").unlink()

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], False)
        self.assertTrue(any("status.md" in error for error in result["errors"]))

    def test_next_step_uses_stage_mapping(self):
        next_step = load_module(NEXT_STEP_SCRIPT, "dev_workflow_next_step")
        tmpdir, task_dir = self.make_task(stage="draft_user_flow", status="active")
        self.addCleanup(tmpdir.cleanup)

        result = next_step.get_next_step(task_dir)

        self.assertEqual(result["stage"], "draft_user_flow")
        self.assertIn("Human approval", result["message"])
        self.assertIn("handoffs/25-human-approval.md", result["action"])

    def test_next_step_returns_done_for_completed_tasks(self):
        next_step = load_module(NEXT_STEP_SCRIPT, "dev_workflow_next_step")
        tmpdir, task_dir = self.make_task(stage="next_cycle", status="done")
        self.addCleanup(tmpdir.cleanup)

        result = next_step.get_next_step(task_dir)

        self.assertEqual(result["message"], "Task is complete.")

    def test_next_step_stops_when_task_is_waiting(self):
        next_step = load_module(NEXT_STEP_SCRIPT, "dev_workflow_next_step")
        tmpdir, task_dir = self.make_task(stage="human_approval_gate", status="waiting")
        self.addCleanup(tmpdir.cleanup)

        result = next_step.get_next_step(task_dir)

        self.assertEqual(result["stage"], "human_approval_gate")
        self.assertIn("waiting", result["message"])

    def test_validate_task_reports_missing_frontmatter(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)
        prd_path = task_dir / "handoffs" / "10-prd.md"
        prd_path.write_text("# PRD without frontmatter\n")

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], False)
        self.assertTrue(any("frontmatter" in error.lower() for error in result["errors"]))

    def test_validate_task_reports_missing_status_summary_fields(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)
        (task_dir / "status.md").write_text("# Broken Status\n")

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], False)
        self.assertTrue(any("Current stage" in error for error in result["errors"]))

    def test_validate_task_reports_missing_review_sections(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)
        review_path = task_dir / "handoffs" / "60-codex-review-r1.md"
        review_path.write_text(
            "---\n"
            'task_id: "TASK-2026-03-15-helper-demo"\n'
            "author: codex\n"
            "role: reviewer\n"
            "---\n\n"
            "# Review\n\n"
            "## Summary\n\n"
            "Incomplete review.\n"
        )

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], False)
        self.assertTrue(any("Required Changes" in error for error in result["errors"]))

    def test_validate_task_reports_missing_user_flow_failure_contract(self):
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        tmpdir, task_dir = self.make_task()
        self.addCleanup(tmpdir.cleanup)
        user_flow_yaml_path = task_dir / "handoffs" / "21-user-flow.yaml"
        user_flow_yaml_path.write_text(
            'task_id: "TASK-2026-03-15-helper-demo"\n'
            "flow_name: example-flow\n"
            "steps:\n"
            "  - id: entry\n"
            "    validation:\n"
            "      type: schema\n"
            "    next:\n"
            "      - classify_task\n"
        )

        result = validate.validate_task(task_dir)

        self.assertEqual(result["ok"], False)
        self.assertTrue(any("failure contract" in error for error in result["errors"]))

    def test_update_task_state_writes_observer_ready_fields(self):
        update_state = load_module(UPDATE_STATE_SCRIPT, "update_task_state")
        tmpdir, task_dir = self.make_task(stage="clarify_objective", status="active")
        self.addCleanup(tmpdir.cleanup)

        state = update_state.update_task_state(
            task_dir,
            stage="draft_user_flow",
            status="waiting",
            current_actor="human",
            round=1,
            last_artifact="handoffs/20-user-flow.md",
            stop_reason="awaiting_approval",
            updated_at="2026-03-18T13:00:00Z",
            enforce=False,
        )

        self.assertEqual(state["stage"], "draft_user_flow")
        self.assertEqual(state["current_phase"], "document_authoring")
        self.assertEqual(state["status"], "waiting")
        self.assertEqual(state["current_actor"], "human")
        self.assertEqual(state["round"], 1)
        self.assertEqual(state["last_artifact"], "handoffs/20-user-flow.md")
        self.assertEqual(state["stop_reason"], "awaiting_approval")
        self.assertEqual(state["updated_at"], "2026-03-18T13:00:00Z")

    def test_append_task_event_uses_current_state_defaults(self):
        append_event = load_module(APPEND_EVENT_SCRIPT, "append_task_event")
        tmpdir, task_dir = self.make_task(stage="draft_prd", status="active")
        self.addCleanup(tmpdir.cleanup)

        event = append_event.append_task_event(
            task_dir,
            event="artifact_written",
            timestamp="2026-03-18T13:10:00Z",
            artifact="handoffs/10-prd.md",
        )

        self.assertEqual(event["task_id"], "TASK-2026-03-15-helper-demo")
        self.assertEqual(event["phase"], "document_authoring")
        self.assertEqual(event["stage"], "draft_prd")
        self.assertEqual(event["actor"], "codex")
        self.assertEqual(event["artifact"], "handoffs/10-prd.md")
        self.assertEqual(event["status"], "active")
        self.assertEqual(event["round"], 0)

        lines = (task_dir / "system" / "run-log.jsonl").read_text().strip().splitlines()
        self.assertTrue(any(json.loads(line)["event"] == "artifact_written" for line in lines))

    def test_append_task_event_rejects_unknown_event_names(self):
        append_event = load_module(APPEND_EVENT_SCRIPT, "append_task_event")
        tmpdir, task_dir = self.make_task(stage="draft_prd", status="active")
        self.addCleanup(tmpdir.cleanup)

        with self.assertRaises(ValueError):
            append_event.append_task_event(task_dir, event="human_gate_pending")


class TestEnforcementIntegration(unittest.TestCase):
    """Integration tests for workflow enforcement in update_task_state."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def make_task(self, stage="clarify_objective", actor="codex"):
        task_dir = Path(self.tmp) / "TASK-enforce-test"
        if task_dir.exists():
            shutil.rmtree(task_dir)
        task_dir.mkdir(parents=True)
        (task_dir / "handoffs").mkdir()
        (task_dir / "system").mkdir()
        state = {
            "task_id": "TASK-enforce-test",
            "status": "active",
            "current_phase": "intention_framing",
            "stage": stage,
            "round": 0,
            "current_actor": actor,
            "last_artifact": None,
            "updated_at": None,
            "stop_reason": None,
        }
        (task_dir / "system" / "state.json").write_text(json.dumps(state, indent=2) + "\n")
        (task_dir / "system" / "run-log.jsonl").write_text("")
        (task_dir / "status.md").write_text(
            "# Status\nCurrent stage: x\nCurrent owner: x\nCurrent round: 0\n"
            "Latest conclusion: x\nBlockers: x\nNext step: x\n"
        )
        (task_dir / "decision-log.md").write_text("# Decision Log\n")
        return task_dir

    def test_rejects_invalid_transition(self):
        update_state = load_module(UPDATE_STATE_SCRIPT, "update_task_state")
        task_dir = self.make_task(stage="clarify_objective")
        with self.assertRaises(SystemExit):
            update_state.update_task_state(task_dir, stage="draft_prd", current_actor="codex")

    def test_rejects_wrong_actor(self):
        update_state = load_module(UPDATE_STATE_SCRIPT, "update_task_state")
        task_dir = self.make_task(stage="clarify_objective")
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: TEST\n---\n## Objective\nReal\n"
        )
        with self.assertRaises(SystemExit):
            update_state.update_task_state(task_dir, stage="classify_task", current_actor="claude_code")

    def test_rejects_unapproved_human_gate(self):
        update_state = load_module(UPDATE_STATE_SCRIPT, "update_task_state")
        task_dir = self.make_task(stage="human_approval_gate", actor="human")
        for name, content in [
            ("10-prd.md", "---\ntask_id: T\n---\n## Purpose\nX\n## Scope\nX"),
            ("20-user-flow.md", "---\ntask_id: T\n---\n## Entry Point\nX\n## Steps\nX\n## Completion\nX"),
            ("25-human-approval.md", "---\nauthor: codex\nstatus: pending\n---\n## Decision\nPending"),
        ]:
            (task_dir / "handoffs" / name).write_text(content)
        with self.assertRaises(SystemExit):
            update_state.update_task_state(task_dir, stage="draft_implementation_plan", current_actor="codex")

    def test_event_rejects_false_stage_completion(self):
        """Cannot log stage_completed for a stage that is not current."""
        append_event = load_module(APPEND_EVENT_SCRIPT, "append_task_event")
        task_dir = self.make_task(stage="clarify_objective")
        with self.assertRaises(SystemExit):
            append_event.append_task_event(task_dir, event="stage_completed", stage="draft_prd")

    def test_next_step_includes_dashboard_reminder(self):
        """Next step output includes dashboard reminder."""
        task_dir = self.make_task(stage="clarify_objective")
        next_step = load_module(NEXT_STEP_SCRIPT, "dev_workflow_next_step")
        result = next_step.get_next_step(task_dir)
        self.assertIn("reminder", result)
        self.assertIn("dashboard", result["reminder"].lower())

    def test_validate_warns_on_template_content(self):
        """Validation should warn when handoff files contain template placeholders."""
        validate = load_module(VALIDATE_SCRIPT, "validate_dev_workflow_task")
        task_dir = self.make_task(stage="clarify_objective")
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: {{TASK_ID}}\n---\n## Objective\n{{PURPOSE}}\n"
        )
        # Need to also create required files for validation to not error
        for name in ["10-prd.md", "20-user-flow.md", "21-user-flow.yaml",
                      "30-implementation-plan.md", "40-execution-prompt.md"]:
            (task_dir / "handoffs" / name).write_text("placeholder content")
        (task_dir / "system" / "state.json").write_text(
            json.dumps({"task_id": "T", "status": "active", "stage": "clarify_objective",
                         "round": 0, "current_actor": "codex", "last_artifact": None, "stop_reason": None})
        )
        result = validate.validate_task(task_dir)
        self.assertTrue(any("template" in w.lower() for w in result.get("warnings", [])))

    def test_valid_transition_succeeds_with_enforcement(self):
        update_state = load_module(UPDATE_STATE_SCRIPT, "update_task_state")
        task_dir = self.make_task(stage="clarify_objective")
        (task_dir / "handoffs" / "00-intake.md").write_text(
            "---\ntask_id: TEST\n---\n## Objective\nReal\n"
        )
        state = update_state.update_task_state(task_dir, stage="classify_task", current_actor="codex")
        self.assertEqual(state["stage"], "classify_task")
        self.assertEqual(state["current_actor"], "codex")
        self.assertEqual(state["current_phase"], "intention_framing")


if __name__ == "__main__":
    unittest.main()
