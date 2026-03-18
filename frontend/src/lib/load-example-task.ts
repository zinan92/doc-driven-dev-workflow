import type { ExampleTaskSnapshot } from "../types/workflow";
import rawData from "../data/example-task.json";

export function loadExampleTask(): ExampleTaskSnapshot {
  return rawData as unknown as ExampleTaskSnapshot;
}
