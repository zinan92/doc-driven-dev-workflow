import type { WorkflowSnapshot, WorkflowStep } from "../types/workflow";
import { StepDetailPanel } from "./step-detail-panel";
import { ArtifactPreviewPanel } from "./artifact-preview-panel";

interface WorkflowInspectorProps {
  readonly snapshot: WorkflowSnapshot;
  readonly step: WorkflowStep;
  readonly activeTab: string;
  readonly tabs: readonly string[];
  readonly artifactTitle: string;
  readonly content: string;
  readonly onChangeTab: (tab: string) => void;
}

export function WorkflowInspector({
  snapshot,
  step,
  activeTab,
  tabs,
  artifactTitle,
  content,
  onChangeTab,
}: WorkflowInspectorProps) {
  return (
    <aside className="flex h-full flex-col gap-4 rounded-2xl border border-gray-800 bg-[#111111] p-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-100">Inspector</h2>
        <p className="mt-1 text-xs text-gray-500">Selected step, outputs, and local workflow context.</p>
      </div>

      <StepDetailPanel step={step} />

      <ArtifactPreviewPanel
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        artifactTitle={artifactTitle}
        content={content}
      />

      <section className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-200">Working Folder</h3>
        <div className="text-xs font-mono text-gray-400">{snapshot.sourceDir}</div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-200">Context</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center justify-between gap-3">
            <span>Status</span>
            <span className="font-mono text-gray-200">{snapshot.state.status}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Actor</span>
            <span className="font-mono text-gray-200">{snapshot.state.current_actor}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Last Artifact</span>
            <span className="max-w-[180px] truncate font-mono text-gray-200">{snapshot.state.last_artifact}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Handoffs</span>
            <span className="font-mono text-gray-200">{snapshot.handoffs.length}</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
