#!/usr/bin/env python3
"""Show the next recommended action for a document-driven task."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


STAGE_ACTIONS = {
    "clarify_objective": ("Codex should classify the task and estimate scope.", "Write handoffs/05-task-classification.yaml and handoffs/08-scope-estimate.md"),
    "classify_task": ("Codex should run product research before PRD drafting.", "Write handoffs/09-product-research.md"),
    "product_research": ("Codex should collect reference evidence for the chosen anchors.", "Write handoffs/09-reference-evidence.md"),
    "collect_reference_evidence": ("Human approval is required before PRD drafting.", "Write handoffs/09-research-approval.md"),
    "research_approval_gate": ("Codex should draft the PRD.", "Write handoffs/10-prd.md"),
    "draft_prd": ("Codex should review the PRD against reality.", "Write handoffs/15-prd-reality-review.md"),
    "prd_reality_review": ("Codex should draft the user flow.", "Write handoffs/20-user-flow.md and handoffs/21-user-flow.yaml"),
    "draft_user_flow": ("Codex should draft the prototype brief.", "Write handoffs/22-prototype-brief.md"),
    "draft_prototype_brief": ("Human approval is required before implementation planning.", "Write handoffs/25-human-approval.md"),
    "design_approval_gate": ("Codex should draft the implementation plan.", "Write handoffs/30-implementation-plan.md and handoffs/32-execution-workflow.yaml"),
    "draft_implementation_plan": ("Codex should review the implementation plan.", "Write handoffs/35-plan-review.md"),
    "review_implementation_plan": ("Codex should write the execution prompt.", "Write handoffs/40-execution-prompt.md"),
    "write_execution_prompt": ("Claude Code should start implementation.", "Write handoffs/50-claude-batch-r1.md"),
    "claude_code_batch_execution": ("Codex should review the latest Claude batch.", "Write the next Codex review handoff"),
    "codex_reviews_batch": ("Either go back to another Claude batch, request a phase gate, or move to final revision based on the gate decision.", "Write the next Claude batch, handoffs/85-phase-gate.md, or handoffs/90-claude-final.md"),
    "gate_major_phase": ("Claude Code should prepare the final revision handoff after the gate is approved.", "Write handoffs/90-claude-final.md"),
    "final_revision": ("Human should run integration checks.", "Update handoffs/95-integration-checklist.md"),
    "integrate_and_verify": ("Codex should prepare the release package.", "Write handoffs/96-release-package.md"),
    "prepare_release_package": ("Human approval is required before the workflow shifts into maintenance.", "Write handoffs/97-delivery-approval.md"),
    "delivery_approval_gate": ("Codex should capture the next cycle.", "Write handoffs/99-next-cycle.md"),
    "capture_next_cycle": ("Codex should update backlog and debt.", "Write handoffs/100-backlog-and-debt.md"),
    "update_backlog_and_debt": ("Task is complete.", "No further action required"),
}

LEGACY_STAGE_ALIASES = {
    "intake": "clarify_objective",
    "classification": "classify_task",
    "scope_estimation": "classify_task",
    "prd": "draft_prd",
    "user_flow": "draft_user_flow",
    "approval": "design_approval_gate",
    "implementation_plan": "draft_implementation_plan",
    "plan_review": "review_implementation_plan",
    "execution_prompt": "write_execution_prompt",
    "implementation_batch": "claude_code_batch_execution",
    "review": "codex_reviews_batch",
    "integration": "integrate_and_verify",
}


def get_next_step(task_dir: Path) -> dict[str, str]:
    state_path = task_dir / "system" / "state.json"
    if not state_path.exists():
        raise FileNotFoundError(f"Missing state file: {state_path}")

    state = json.loads(state_path.read_text())
    status = state.get("status", "unknown")
    stage = state.get("stage", "unknown")
    stage = LEGACY_STAGE_ALIASES.get(stage, stage)

    reminder = "Ensure the Workflow Observer Dashboard is running at http://localhost:5173 before proceeding."

    if status == "done":
        return {"stage": stage, "message": "Task is complete.", "action": "No further action required", "reminder": reminder}
    if status == "waiting":
        return {
            "stage": stage,
            "message": "Task is waiting at a gate or external dependency and must not auto-advance.",
            "action": "Resolve the pending gate or dependency before continuing",
            "reminder": reminder,
        }
    if status == "blocked":
        return {
            "stage": stage,
            "message": "Task is blocked and requires intervention before continuing.",
            "action": "Inspect stop_reason, status.md, and the latest handoff",
            "reminder": reminder,
        }

    message, action = STAGE_ACTIONS.get(
        stage,
        ("State is unknown. Inspect the latest handoff and status.md.", "Check status.md and system/state.json"),
    )
    return {"stage": stage, "message": message, "action": action, "reminder": reminder}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_dir", help="Path to the task directory")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = get_next_step(Path(args.task_dir))
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
