import { useMemo, useState } from "react";
import { loadWorkflowSnapshots } from "./lib/load-workflow-snapshots";
import { mapArtifactsToStages } from "./lib/map-artifacts-to-stages";
import { mapRunLogToEvents } from "./lib/map-run-log-to-events";
import { renderArtifactContent } from "./lib/render-artifact-content";
import { buildSchemaContent } from "./lib/build-schema-content";
import { useReplayState } from "./state/use-replay-state";
import { SummaryBar } from "./components/summary-bar";
import { TaskRail } from "./components/task-rail";
import { WorkflowCanvas } from "./components/workflow-canvas";
import { WorkflowInspector } from "./components/workflow-inspector";

const ARTIFACT_TABS = ["Artifact", "Schema", "State"] as const;

export default function App() {
  const collection = useMemo(() => loadWorkflowSnapshots(), []);
  const [selectedTaskId, setSelectedTaskId] = useState(
    () => collection.snapshots.find((snapshot) => snapshot.state.status === "active")?.id ?? collection.snapshots[0]?.id ?? "",
  );
  const snapshot = collection.snapshots.find((item) => item.id === selectedTaskId) ?? collection.snapshots[0];
  const steps = useMemo(
    () =>
      snapshot
        ? mapArtifactsToStages({ state: snapshot.state, handoffs: snapshot.handoffs, runLog: snapshot.runLog })
        : [],
    [snapshot],
  );
  const timelineEvents = useMemo(
    () => (snapshot ? mapRunLogToEvents(snapshot.handoffs, snapshot.runLog) : []),
    [snapshot],
  );

  const { selectedStepId, activeTab, selectStep, setActiveTab } = useReplayState(
    snapshot?.state.stage ?? "clarify_objective",
  );

  const selectedStep = steps.find((s) => s.id === selectedStepId) ?? steps[0];

  const stageTimestamps = useMemo(
    () =>
      Object.fromEntries(
        timelineEvents.map((event) => [event.stageId, event.timestamp]),
      ) as Record<string, string>,
    [timelineEvents],
  );

  const tabContent = useMemo(() => {
    if (!snapshot || !selectedStep) return "";
    if (activeTab === "Schema") return buildSchemaContent(selectedStep);
    if (activeTab === "State") return JSON.stringify(snapshot.state, null, 2);
    return renderArtifactContent(selectedStep.artifactContent, selectedStep.evidence);
  }, [activeTab, selectedStep, snapshot]);

  const artifactTitle = useMemo(() => {
    if (!selectedStep) return "No step selected";
    if (activeTab === "Schema") return `${selectedStep.id} — step contract`;
    if (activeTab === "State") return "system/state.json";
    if (selectedStep.outputs.length > 0) return selectedStep.outputs[0];
    return selectedStep.id;
  }, [activeTab, selectedStep]);

  if (!snapshot || !selectedStep) {
    return <div className="min-h-screen bg-gray-950 p-6 text-gray-200">No workflow snapshots available.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-100">
      <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)_380px] gap-4 p-4">
        <TaskRail
          tasks={collection.snapshots.map((task) => ({
            id: task.id,
            label: task.label,
            status: task.state.status,
            sourceDir: task.sourceDir,
          }))}
          selectedTaskId={snapshot.id}
          onSelect={setSelectedTaskId}
        />

        <main className="flex min-h-[calc(100vh-2rem)] flex-col gap-4">
          <header className="flex items-center justify-between rounded-2xl border border-gray-800 bg-[#111111] px-5 py-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Workflow Driven Developer</h1>
              <p className="mt-1 text-sm text-gray-500">Local-first observer for doc-driven development workflows.</p>
            </div>
            <span className="text-xs text-gray-600 font-mono">v1.1 workflow-first cockpit</span>
          </header>

          <SummaryBar
            taskId={snapshot.state.task_id}
            workflowName={snapshot.label}
            status={snapshot.state.status}
            currentStage={snapshot.state.stage}
            currentActor={snapshot.state.current_actor}
            round={snapshot.state.round}
          />

          <WorkflowCanvas
            steps={steps}
            selectedStepId={selectedStepId}
            onSelect={selectStep}
            stageTimestamps={stageTimestamps}
          />
        </main>

        <WorkflowInspector
          snapshot={snapshot}
          step={selectedStep}
          activeTab={activeTab}
          tabs={[...ARTIFACT_TABS]}
          artifactTitle={artifactTitle}
          content={tabContent}
          onChangeTab={setActiveTab}
        />
      </div>
    </div>
  );
}
