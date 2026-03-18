import { useMemo } from "react";
import { loadExampleTask } from "./lib/load-example-task";
import { mapArtifactsToStages } from "./lib/map-artifacts-to-stages";
import { mapRunLogToEvents } from "./lib/map-run-log-to-events";
import { buildReplaySnapshots } from "./lib/build-replay-snapshots";
import { renderArtifactContent } from "./lib/render-artifact-content";
import { buildSchemaContent } from "./lib/build-schema-content";
import { useReplayState } from "./state/use-replay-state";
import { SummaryBar } from "./components/summary-bar";
import { WorkflowGraph } from "./components/workflow-graph";
import { StepDetailPanel } from "./components/step-detail-panel";
import { ArtifactPreviewPanel } from "./components/artifact-preview-panel";
import { ReplayTimeline } from "./components/replay-timeline";

const ARTIFACT_TABS = ["Artifact", "Schema", "State", "Event"] as const;

export default function App() {
  const snapshot = useMemo(() => loadExampleTask(), []);
  const steps = useMemo(
    () => mapArtifactsToStages({ state: snapshot.state, handoffs: snapshot.handoffs, runLog: snapshot.runLog }),
    [snapshot],
  );
  const timelineEvents = useMemo(() => mapRunLogToEvents(snapshot.handoffs, snapshot.runLog), [snapshot]);
  const replaySnapshots = useMemo(() => buildReplaySnapshots(timelineEvents), [timelineEvents]);

  const { selectedStepId, selectedEventIndex, activeTab, selectStep, selectEvent, setActiveTab } =
    useReplayState(snapshot.state.stage);

  const selectedStep = steps.find((s) => s.id === selectedStepId) ?? steps[0];

  const effectiveSteps = useMemo(() => {
    if (selectedEventIndex === null) return steps;
    const snap = replaySnapshots[selectedEventIndex];
    if (!snap) return steps;
    return steps.map((s) => {
      if (snap.completedStageIds.includes(s.id)) return { ...s, status: "completed" as const };
      if (s.id === snap.activeStageId) return { ...s, status: "selected" as const };
      return { ...s, status: "not_reached" as const };
    });
  }, [steps, selectedEventIndex, replaySnapshots]);

  const effectiveSummary = useMemo(() => {
    if (selectedEventIndex === null) {
      return {
        stage: snapshot.state.stage,
        actor: snapshot.state.current_actor,
        status: snapshot.state.status,
      };
    }
    const snap = replaySnapshots[selectedEventIndex];
    return snap
      ? { stage: snap.activeStageId, actor: snap.actor, status: "active" as const }
      : { stage: snapshot.state.stage, actor: snapshot.state.current_actor, status: snapshot.state.status };
  }, [snapshot, selectedEventIndex, replaySnapshots]);

  const tabContent = useMemo(() => {
    if (activeTab === "Schema") return buildSchemaContent(selectedStep);
    if (activeTab === "State") return JSON.stringify(snapshot.state, null, 2);
    if (activeTab === "Event" && selectedEventIndex !== null) {
      const ev = timelineEvents[selectedEventIndex];
      return ev ? JSON.stringify(ev, null, 2) : "Select a timeline event";
    }
    if (activeTab === "Event") return "Select a timeline event to preview";
    return renderArtifactContent(selectedStep.artifactContent, selectedStep.evidence);
  }, [activeTab, selectedStep, snapshot, selectedEventIndex, timelineEvents]);

  const artifactTitle = useMemo(() => {
    if (activeTab === "Schema") return `${selectedStep.id} — step contract`;
    if (activeTab === "State") return "system/state.json";
    if (activeTab === "Event") return "timeline event";
    if (selectedStep.outputs.length > 0) return selectedStep.outputs[0];
    return selectedStep.id;
  }, [activeTab, selectedStep]);

  const handleTimelineSelect = (eventId: string, stageId: string) => {
    const idx = Number(eventId);
    selectEvent(idx, stageId);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Workflow Driven Developer</h1>
        <span className="text-xs text-gray-600 font-mono">v1 read-only cockpit</span>
      </header>

      <SummaryBar
        taskId={snapshot.state.task_id}
        workflowName="Doc-Driven Development"
        status={effectiveSummary.status}
        currentStage={effectiveSummary.stage}
        currentActor={effectiveSummary.actor}
        round={snapshot.state.round}
      />

      <WorkflowGraph steps={effectiveSteps} selectedStepId={selectedStepId} onSelect={selectStep} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <StepDetailPanel step={selectedStep} />
        </div>
        <div className="flex flex-col gap-4">
          <ArtifactPreviewPanel
            tabs={[...ARTIFACT_TABS]}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            artifactTitle={artifactTitle}
            content={tabContent}
          />
        </div>
      </div>

      <ReplayTimeline
        events={timelineEvents}
        selectedEventId={selectedEventIndex !== null ? String(selectedEventIndex) : null}
        onSelect={handleTimelineSelect}
      />
    </div>
  );
}
