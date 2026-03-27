#!/usr/bin/env python3
"""Update the current state.json for a document-driven development task."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from workflow_guard import load_canonical_workflow, guard_transition, resolve_stage_phase


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _default_phase() -> str:
    return "maintenance"


def _read_task_size(task_dir: Path) -> str | None:
    """Read task_size from 05-task-classification.yaml if it exists."""
    classification = task_dir / "handoffs" / "05-task-classification.yaml"
    if not classification.exists():
        return None
    content = classification.read_text()
    for line in content.splitlines():
        if line.strip().startswith("task_size:"):
            return line.partition(":")[2].strip().strip('"').strip("'")
    return None


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
    enforce: bool = True,
) -> dict[str, object]:
    state_path = task_dir / "system" / "state.json"
    state = json.loads(state_path.read_text())
    workflow = load_canonical_workflow()

    # --- ENFORCEMENT LAYER ---
    if enforce and stage is not None and stage != state.get("stage"):
        current_stage = state.get("stage", "")
        actor = current_actor or state.get("current_actor", "")
        task_size = _read_task_size(task_dir)
        r = round if round is not None else state.get("round", 0)

        errors = guard_transition(
            workflow, task_dir,
            current_stage=current_stage,
            target_stage=stage,
            actor=actor,
            task_size=task_size,
            current_round=r,
        )
        if errors:
            msg = "BLOCKED by workflow guard:\n" + "\n".join(f"  - {e}" for e in errors)
            print(msg, file=sys.stderr)
            raise SystemExit(1)
    # --- END ENFORCEMENT ---

    if status is not None:
        state["status"] = status
    if stage is not None:
        state["stage"] = stage
        state["current_phase"] = resolve_stage_phase(workflow, stage, state.get("current_phase", _default_phase()))
    elif "current_phase" not in state:
        state["current_phase"] = resolve_stage_phase(workflow, state.get("stage"), _default_phase())
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
    parser.add_argument("--no-enforce", action="store_true", help="Skip workflow guards (emergency override only)")
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
        enforce=not args.no_enforce,
    )
    print(json.dumps(state, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
