interface TaskRailItem {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly sourceDir: string;
}

interface TaskRailProps {
  readonly tasks: readonly TaskRailItem[];
  readonly selectedTaskId: string;
  readonly onSelect: (taskId: string) => void;
}

export function TaskRail({ tasks, selectedTaskId, onSelect }: TaskRailProps) {
  return (
    <aside className="h-full rounded-2xl border border-gray-800 bg-[#111111] p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-100">Tasks</h2>
        <p className="mt-1 text-xs text-gray-500">Local workflow snapshots available in this repo.</p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const selected = task.id === selectedTaskId;
          return (
            <button
              key={task.id}
              onClick={() => onSelect(task.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                selected
                  ? "border-cyan-400/60 bg-cyan-400/10"
                  : "border-gray-800 bg-gray-950 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium capitalize text-gray-100">{task.label}</div>
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                  {task.status}
                </span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-gray-500">{task.sourceDir}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
