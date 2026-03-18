import { render, screen } from "@testing-library/react";
import { WorkflowCanvas } from "./workflow-canvas";

test("renders four workflow phases and canonical stages", () => {
  render(<WorkflowCanvas steps={[]} selectedStepId="clarify_objective" onSelect={() => {}} stageTimestamps={{}} />);

  expect(screen.getByRole("heading", { name: /intent framing/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /spec authoring/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^execution$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /integration/i })).toBeInTheDocument();
  expect(screen.getByText(/clarify_objective/i)).toBeInTheDocument();
  expect(screen.getByText(/next_cycle/i)).toBeInTheDocument();
});
