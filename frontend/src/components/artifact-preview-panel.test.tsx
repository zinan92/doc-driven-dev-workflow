import { render, screen } from "@testing-library/react";
import { ArtifactPreviewPanel } from "./artifact-preview-panel";

test("renders artifact content and title", () => {
  render(
    <ArtifactPreviewPanel
      tabs={["Artifact", "Schema", "State", "Event"]}
      activeTab="Artifact"
      onChangeTab={() => {}}
      artifactTitle="handoffs/20-user-flow.md"
      content="# User Flow"
    />,
  );

  expect(screen.getByText("handoffs/20-user-flow.md")).toBeInTheDocument();
  expect(screen.getByText("# User Flow")).toBeInTheDocument();
});

test("renders all four tabs including Schema", () => {
  render(
    <ArtifactPreviewPanel
      tabs={["Artifact", "Schema", "State", "Event"]}
      activeTab="Schema"
      onChangeTab={() => {}}
      artifactTitle="draft_prd — step contract"
      content="step_contract:"
    />,
  );

  expect(screen.getByText("Artifact")).toBeInTheDocument();
  expect(screen.getByText("Schema")).toBeInTheDocument();
  expect(screen.getByText("State")).toBeInTheDocument();
  expect(screen.getByText("Event")).toBeInTheDocument();
});
