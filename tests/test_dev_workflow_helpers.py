import importlib.util
import json
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


if __name__ == "__main__":
    unittest.main()
