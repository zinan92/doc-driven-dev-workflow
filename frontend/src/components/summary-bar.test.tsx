import { render, screen } from "@testing-library/react";
import { SummaryBar } from "./summary-bar";

test("renders current stage, actor, and status", () => {
  render(
    <SummaryBar
      taskId="TASK-1"
      workflowName="Example"
      status="done"
      currentStage="update_backlog_and_debt"
      currentActor="human"
      round={2}
    />,
  );

  expect(screen.getByText(/task-1/i)).toBeInTheDocument();
  expect(screen.getByText(/human/i)).toBeInTheDocument();
  expect(screen.getByText(/update_backlog_and_debt/i)).toBeInTheDocument();
});
