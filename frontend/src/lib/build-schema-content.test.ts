import { buildSchemaContent } from "./build-schema-content";

test("returns step contract for known stage", () => {
  const content = buildSchemaContent({
    id: "draft_prd",
    inputs: ["handoffs/00-intake.md"],
    outputs: ["handoffs/10-prd.md"],
    validation: [],
    failure: [],
    next: ["prd_reality_review"],
  });

  expect(content).toContain("step_contract:");
  expect(content).toContain("draft_prd");
  expect(content).toContain("required_sections:");
  expect(content).toContain("purpose");
  expect(content).toContain("acceptance criteria");
});

test("returns step contract for design_approval_gate", () => {
  const content = buildSchemaContent({
    id: "design_approval_gate",
    inputs: [],
    outputs: [],
    validation: [],
    failure: [],
    next: [],
  });

  expect(content).toContain("human_approval_gate");
  expect(content).toContain("allowed_decisions:");
  expect(content).toContain("approved");
});
