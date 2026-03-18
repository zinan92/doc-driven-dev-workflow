import type { NodeStatus } from "../types/workflow";

interface NodeVisual {
  readonly borderColor: string;
  readonly bgColor: string;
  readonly textColor: string;
  readonly dotColor: string;
}

export function getNodeVisualState(status: NodeStatus, isSelected: boolean): NodeVisual {
  if (isSelected) {
    return {
      borderColor: "border-cyan-400",
      bgColor: "bg-cyan-400/10",
      textColor: "text-cyan-300",
      dotColor: "bg-cyan-400",
    };
  }

  switch (status) {
    case "completed":
      return {
        borderColor: "border-green-600",
        bgColor: "bg-green-400/5",
        textColor: "text-green-400",
        dotColor: "bg-green-500",
      };
    case "waiting":
      return {
        borderColor: "border-amber-500",
        bgColor: "bg-amber-400/5",
        textColor: "text-amber-400",
        dotColor: "bg-amber-500",
      };
    case "blocked":
      return {
        borderColor: "border-red-500",
        bgColor: "bg-red-400/5",
        textColor: "text-red-400",
        dotColor: "bg-red-500",
      };
    case "not_reached":
    default:
      return {
        borderColor: "border-gray-700",
        bgColor: "bg-gray-800/50",
        textColor: "text-gray-500",
        dotColor: "bg-gray-600",
      };
  }
}
