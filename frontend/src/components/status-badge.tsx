import type { NodeStatus } from "../types/workflow";

const STATUS_STYLES: Record<NodeStatus, string> = {
  completed: "text-green-400 bg-green-400/10",
  selected: "text-cyan-400 bg-cyan-400/10",
  waiting: "text-amber-400 bg-amber-400/10",
  blocked: "text-red-400 bg-red-400/10",
  not_reached: "text-gray-500 bg-gray-500/10",
};

export function StatusBadge({ status }: { readonly status: NodeStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
