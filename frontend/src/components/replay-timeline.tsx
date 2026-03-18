import type { TimelineEvent } from "../lib/map-run-log-to-events";

interface ReplayTimelineProps {
  readonly events: readonly TimelineEvent[];
  readonly selectedEventId: string | null;
  readonly onSelect: (eventId: string, stageId: string) => void;
  readonly title?: string;
}

const ACTOR_COLOR: Record<string, string> = {
  human: "text-amber-300",
  codex: "text-purple-400",
  claude_code: "text-cyan-400",
};

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ReplayTimeline({ events, selectedEventId, onSelect, title = "Replay Timeline" }: ReplayTimelineProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h2>
      <div className="flex flex-col gap-1">
        {events.map((ev, idx) => {
          const isSelected = ev.id === selectedEventId;
          const time = formatTimestamp(ev.timestamp);
          return (
            <button
              key={ev.id}
              onClick={() => onSelect(ev.id, ev.stageId)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-xs text-left transition-colors ${
                isSelected
                  ? "bg-cyan-400/10 border border-cyan-400"
                  : "bg-gray-950 border border-gray-800 hover:border-gray-700"
              }`}
            >
              <span className="text-gray-600 font-mono shrink-0 w-5 text-right">{idx + 1}</span>
              {time && <span className="text-gray-500 font-mono shrink-0">{time}</span>}
              <span className="font-mono text-gray-200">{ev.label}</span>
              <span className={`font-mono ${ACTOR_COLOR[ev.actor] ?? "text-gray-400"}`}>{ev.actor}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
