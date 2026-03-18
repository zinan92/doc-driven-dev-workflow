export function renderArtifactContent(content: string | null, evidence: string | null): string {
  if (content) return content;
  if (evidence) return evidence;
  return "No artifact available for this stage.";
}
