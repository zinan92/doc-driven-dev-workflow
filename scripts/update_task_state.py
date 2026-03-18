#!/usr/bin/env python3
"""Update the current state.json for a document-driven development task."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


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


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def update_task_state(
    task_dir: Path,
    *,
    status: str | None = None,
    stage: str | None = None,
    current_actor: str | None = None,
    round: int | None = None,
    last_artifact: str | None = None,
    stop_reason: str | None = None,
    updated_at: str | None = None,
) -> dict[str, object]:
    state_path = task_dir / "system" / "state.json"
    state = json.loads(state_path.read_text())

    if status is not None:
        state["status"] = status
    if stage is not None:
        state["stage"] = stage
        state["current_phase"] = PHASE_BY_STAGE.get(stage, state.get("current_phase", "integration_cleanup"))
    elif "current_phase" not in state:
        state["current_phase"] = PHASE_BY_STAGE.get(state.get("stage"), "integration_cleanup")
    if current_actor is not None:
        state["current_actor"] = current_actor
    if round is not None:
        state["round"] = round
    if last_artifact is not None:
        state["last_artifact"] = last_artifact
    if stop_reason is not None:
        state["stop_reason"] = stop_reason

    state["updated_at"] = updated_at or iso_now()
    state_path.write_text(json.dumps(state, indent=2) + "\n")
    return state


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_dir", help="Path to the task directory")
    parser.add_argument("--status", help="New task status")
    parser.add_argument("--stage", help="New canonical stage id")
    parser.add_argument("--actor", dest="current_actor", help="Current actor")
    parser.add_argument("--round", type=int, dest="round", help="Current round or batch")
    parser.add_argument("--artifact", dest="last_artifact", help="Latest artifact path")
    parser.add_argument("--stop-reason", dest="stop_reason", help="Nullable stop reason")
    parser.add_argument("--updated-at", dest="updated_at", help="Override updated_at timestamp")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    state = update_task_state(
        Path(args.task_dir),
        status=args.status,
        stage=args.stage,
        current_actor=args.current_actor,
        round=args.round,
        last_artifact=args.last_artifact,
        stop_reason=args.stop_reason,
        updated_at=args.updated_at,
    )
    print(json.dumps(state, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
