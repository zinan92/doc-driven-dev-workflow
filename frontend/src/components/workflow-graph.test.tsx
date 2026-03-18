import { render, screen } from "@testing-library/react";
import { WorkflowGraph } from "./workflow-graph";

test("renders all canonical workflow stages", () => {
  render(<WorkflowGraph steps={[]} selectedStepId="clarify_objective" onSelect={() => {}} />);
  expect(screen.getByText(/clarify objective/i)).toBeInTheDocument();
  expect(screen.getByText(/draft prd/i)).toBeInTheDocument();
  expect(screen.getByText(/reflect and define the next cycle/i)).toBeInTheDocument();
});
