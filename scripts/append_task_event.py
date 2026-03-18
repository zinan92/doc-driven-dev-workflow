#!/usr/bin/env python3
"""Append a structured event to run-log.jsonl for a document-driven development task."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from workflow_guard import validate_event_consistency, GuardError


PHASE_BY_STAGE = {
    "clarify_objective": "intention_framing",
    "classify_task": "intention_framing",
    "draft_prd": "document_authoring",
    "prd_reality_review": "document_authoring",
    "draft_user_flow": "document_authoring",
    "human_approval_gate": "document_authoring",
    "draft_implementation_plan": "document_authoring",
    "review_implementation_plan": "document_authoring",
    "write_execution_prompt": "document_authoring",
    "claude_code_batch_execution": "code_execution",
    "codex_reviews_batch": "code_execution",
    "gate_major_phase": "code_execution",
    "final_revision": "code_execution",
    "integrate_merge_cleanup": "integration_cleanup",
    "next_cycle": "integration_cleanup",
}

ALLOWED_EVENTS = {
    "task_created",
    "stage_entered",
    "artifact_written",
    "stage_completed",
    "stage_blocked",
    "stage_waiting",
    "review_decision",
    "task_completed",
}


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def append_task_event(
    task_dir: Path,
    *,
    event: str,
    timestamp: str | None = None,
    actor: str | None = None,
    stage: str | None = None,
    phase: str | None = None,
    artifact: str | None = None,
    status: str | None = None,
    round: int | None = None,
) -> dict[str, object]:
    state_path = task_dir / "system" / "state.json"
    run_log_path = task_dir / "system" / "run-log.jsonl"

    if event not in ALLOWED_EVENTS:
        raise ValueError(f"Unsupported workflow event: {event}")

    state = json.loads(state_path.read_text())
    resolved_stage = stage or state.get("stage", "clarify_objective")
    resolved_phase = phase or PHASE_BY_STAGE.get(resolved_stage) or state.get("current_phase", "integration_cleanup")

    payload = {
        "timestamp": timestamp or iso_now(),
        "event": event,
        "task_id": state["task_id"],
        "phase": resolved_phase,
        "stage": resolved_stage,
        "actor": actor or state.get("current_actor", "codex"),
        "artifact": artifact,
        "status": status or state.get("status", "active"),
        "round": round if round is not None else state.get("round", 0),
    }

    # --- EVENT CONSISTENCY GUARD ---
    try:
        validate_event_consistency(event, resolved_stage, state)
    except GuardError as e:
        print(f"BLOCKED: {e}", file=sys.stderr)
        raise SystemExit(1)
    # --- END GUARD ---

    with run_log_path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload) + "\n")

    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_dir", help="Path to the task directory")
    parser.add_argument("--event", required=True, help="Workflow event type")
    parser.add_argument("--timestamp", help="Override timestamp in ISO8601")
    parser.add_argument("--actor", help="Actor responsible for the event")
    parser.add_argument("--stage", help="Canonical stage id")
    parser.add_argument("--phase", help="Phase bucket")
    parser.add_argument("--artifact", help="Related artifact path")
    parser.add_argument("--status", help="Task status at event time")
    parser.add_argument("--round", type=int, dest="round", help="Current round or batch")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    event = append_task_event(
        Path(args.task_dir),
        event=args.event,
        timestamp=args.timestamp,
        actor=args.actor,
        stage=args.stage,
        phase=args.phase,
        artifact=args.artifact,
        status=args.status,
        round=args.round,
    )
    print(json.dumps(event, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
