interface SummaryBarProps {
  readonly taskId: string;
  readonly workflowName: string;
  readonly status: string;
  readonly currentStage: string;
  readonly currentActor: string;
  readonly round: number;
}

export function SummaryBar({ taskId, workflowName, status, currentStage, currentActor, round }: SummaryBarProps) {
  return (
    <div className="flex items-center gap-6 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm">
      <div>
        <span className="text-gray-500 mr-1">Task</span>
        <span className="font-mono font-semibold text-cyan-400">{taskId}</span>
      </div>
      <div>
        <span className="text-gray-500 mr-1">Workflow</span>
        <span className="text-gray-200">{workflowName}</span>
      </div>
      <div>
        <span className="text-gray-500 mr-1">Status</span>
        <StatusBadge status={status} />
      </div>
      <div>
        <span className="text-gray-500 mr-1">Stage</span>
        <span className="font-mono text-gray-200">{currentStage}</span>
      </div>
      <div>
        <span className="text-gray-500 mr-1">Actor</span>
        <span className="font-mono text-amber-300">{currentActor}</span>
      </div>
      <div>
        <span className="text-gray-500 mr-1">Round</span>
        <span className="text-gray-200">{round}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { readonly status: string }) {
  const color =
    status === "done"
      ? "text-green-400 bg-green-400/10"
      : status === "active"
        ? "text-cyan-400 bg-cyan-400/10"
        : "text-red-400 bg-red-400/10";

  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{status}</span>;
}
