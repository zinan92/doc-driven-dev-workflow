import { render, screen } from "@testing-library/react";
import { WorkflowCanvas } from "./workflow-canvas";

test("renders five workflow phases and canonical stages", () => {
  render(<WorkflowCanvas steps={[]} selectedStepId="clarify_objective" onSelect={() => {}} stageTimestamps={{}} />);

  expect(screen.getByRole("heading", { name: /^research$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^design$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^development$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^packaging$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^maintenance$/i })).toBeInTheDocument();
  expect(screen.getByText(/clarify_objective/i)).toBeInTheDocument();
  expect(screen.getByText(/update_backlog_and_debt/i)).toBeInTheDocument();
});
