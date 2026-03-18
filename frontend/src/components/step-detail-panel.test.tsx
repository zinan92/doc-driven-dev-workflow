import { render, screen } from "@testing-library/react";
import { StepDetailPanel } from "./step-detail-panel";

test("shows actor, step type, inputs, outputs, and next step", () => {
  render(
    <StepDetailPanel
      step={{
        id: "draft_prd",
        title: "Draft PRD",
        actor: "codex",
        stepType: "llm",
        purpose: "Draft the PRD",
        inputs: ["handoffs/00-intake.md"],
        outputs: ["handoffs/10-prd.md"],
        validation: ["required sections"],
        failure: ["retry_once"],
        next: ["prd_reality_review"],
      }}
    />,
  );

  expect(screen.getByText(/codex/i)).toBeInTheDocument();
  expect(screen.getByText("handoffs/10-prd.md")).toBeInTheDocument();
  expect(screen.getByText("prd_reality_review")).toBeInTheDocument();
});
