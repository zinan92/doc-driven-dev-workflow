import type { WorkflowSnapshotCollection } from "../types/workflow";
import rawData from "../data/workflow-snapshots.json";

export function loadWorkflowSnapshots(): WorkflowSnapshotCollection {
  return rawData as unknown as WorkflowSnapshotCollection;
}
