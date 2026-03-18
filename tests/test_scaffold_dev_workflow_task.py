import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "scaffold_dev_workflow_task.py"
TEMPLATE_ROOT = ROOT / "docs" / "templates" / "development-workflow" / "task-root"


def load_module():
    if not SCRIPT_PATH.exists():
        raise FileNotFoundError(f"Missing scaffolder script: {SCRIPT_PATH}")
    spec = importlib.util.spec_from_file_location("scaffold_dev_workflow_task", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class ScaffoldTaskTests(unittest.TestCase):
    def test_make_task_id_generates_date_prefixed_identifier(self):
        module = load_module()
        task_id = module.make_task_id(feature_name="Park Intel Source Layer", current_date="2026-03-15")

        self.assertEqual(task_id, "TASK-2026-03-15-park-intel-source-layer")

    def test_scaffold_task_creates_expected_files_and_replacements(self):
        module = load_module()
        task_id = "TASK-2026-03-15-demo"
        repo_path = "/tmp/example-repo"
        feature_name = "demo-feature"

        with tempfile.TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / "tasks"
            task_dir = module.scaffold_task(
                task_id=task_id,
                feature_name=feature_name,
                repo_path=repo_path,
                output_root=output_root,
                template_root=TEMPLATE_ROOT,
                current_date="2026-03-15",
            )

            self.assertEqual(task_dir, output_root / task_id)
            self.assertTrue((task_dir / "status.md").exists())
            self.assertTrue((task_dir / "decision-log.md").exists())
            self.assertTrue((task_dir / "handoffs" / "10-prd.md").exists())
            self.assertTrue((task_dir / "handoffs" / "40-execution-prompt.md").exists())
            self.assertTrue((task_dir / "system" / "state.json").exists())
            self.assertTrue((task_dir / "system" / "run-log.jsonl").exists())
            self.assertTrue((task_dir / "system" / "lock").exists())

            intake_text = (task_dir / "handoffs" / "00-intake.md").read_text()
            self.assertIn(task_id, intake_text)
            self.assertIn(repo_path, intake_text)

            prd_text = (task_dir / "handoffs" / "10-prd.md").read_text()
            self.assertIn(f"# PRD: {feature_name}", prd_text)

            status_text = (task_dir / "status.md").read_text()
            self.assertIn(task_id, status_text)
            self.assertNotIn("{{TASK_ID}}", status_text)

            with (task_dir / "system" / "state.json").open() as fh:
                state = json.load(fh)
            self.assertEqual(state["task_id"], task_id)
            self.assertEqual(state["current_actor"], "codex")
            self.assertEqual(state["stage"], "clarify_objective")
            self.assertEqual(state["current_phase"], "intention_framing")

            run_log = (task_dir / "system" / "run-log.jsonl").read_text().strip().splitlines()
            self.assertEqual(len(run_log), 1)
            first_event = json.loads(run_log[0])
            self.assertEqual(first_event["event"], "task_created")
            self.assertEqual(first_event["stage"], "clarify_objective")

    def test_scaffold_task_refuses_to_overwrite_existing_directory(self):
        module = load_module()
        task_id = "TASK-2026-03-15-demo"

        with tempfile.TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / "tasks"
            module.scaffold_task(
                task_id=task_id,
                feature_name="demo-feature",
                repo_path="/tmp/example-repo",
                output_root=output_root,
                template_root=TEMPLATE_ROOT,
                current_date="2026-03-15",
            )

            with self.assertRaises(FileExistsError):
                module.scaffold_task(
                    task_id=task_id,
                    feature_name="demo-feature",
                    repo_path="/tmp/example-repo",
                    output_root=output_root,
                    template_root=TEMPLATE_ROOT,
                    current_date="2026-03-15",
                )

    def test_scaffold_task_generates_task_id_when_missing(self):
        module = load_module()

        with tempfile.TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / "tasks"
            task_dir = module.scaffold_task(
                task_id=None,
                feature_name="Generated Task",
                repo_path="/tmp/example-repo",
                output_root=output_root,
                template_root=TEMPLATE_ROOT,
                current_date="2026-03-15",
            )

            self.assertEqual(task_dir.name, "TASK-2026-03-15-generated-task")
            self.assertTrue((task_dir / "handoffs" / "10-prd.md").exists())

    def test_build_observer_commands_include_external_output_root(self):
        module = load_module()

        commands = module.build_observer_commands(output_root=Path("/tmp/external/tasks"))

        self.assertIn("frontend", commands[0])
        self.assertIn('WORKFLOW_SNAPSHOT_ROOTS="/tmp/external/tasks" npm run build:data', commands[1])
        self.assertEqual(commands[2], "npm run dev")


if __name__ == "__main__":
    unittest.main()
