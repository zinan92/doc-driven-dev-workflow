import { render, screen } from "@testing-library/react";
import { ReplayTimeline } from "./replay-timeline";

test("renders replay events", () => {
  render(
    <ReplayTimeline
      events={[{ id: "1", timestamp: "2026-03-15T10:00:00Z", label: "task_created", actor: "human", stageId: "clarify_objective" }]}
      selectedEventId="1"
      onSelect={() => {}}
    />,
  );

  expect(screen.getByText(/task_created/i)).toBeInTheDocument();
});
