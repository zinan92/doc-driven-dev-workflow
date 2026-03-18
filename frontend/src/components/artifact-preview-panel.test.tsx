import { render, screen } from "@testing-library/react";
import { ArtifactPreviewPanel } from "./artifact-preview-panel";

test("renders artifact content and title", () => {
  render(
    <ArtifactPreviewPanel
      tabs={["Artifact", "Schema", "State"]}
      activeTab="Artifact"
      onChangeTab={() => {}}
      artifactTitle="handoffs/20-user-flow.md"
      content="# User Flow"
    />,
  );

  expect(screen.getByText("handoffs/20-user-flow.md")).toBeInTheDocument();
  expect(screen.getByText("# User Flow")).toBeInTheDocument();
});

test("renders artifact, schema, and state tabs", () => {
  render(
    <ArtifactPreviewPanel
      tabs={["Artifact", "Schema", "State"]}
      activeTab="Schema"
      onChangeTab={() => {}}
      artifactTitle="draft_prd — step contract"
      content="step_contract:"
    />,
  );

  expect(screen.getByText("Artifact")).toBeInTheDocument();
  expect(screen.getByText("Schema")).toBeInTheDocument();
  expect(screen.getByText("State")).toBeInTheDocument();
  expect(screen.queryByText("Event")).not.toBeInTheDocument();
});
