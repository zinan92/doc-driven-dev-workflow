import { ArtifactTabs } from "./artifact-tabs";

interface ArtifactPreviewPanelProps {
  readonly tabs: readonly string[];
  readonly activeTab: string;
  readonly onChangeTab: (tab: string) => void;
  readonly artifactTitle: string;
  readonly content: string;
}

export function ArtifactPreviewPanel({ tabs, activeTab, onChangeTab, artifactTitle, content }: ArtifactPreviewPanelProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <ArtifactTabs tabs={tabs} activeTab={activeTab} onChangeTab={onChangeTab} />
      <div className="text-xs text-gray-500 font-mono mb-2">{artifactTitle}</div>
      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-gray-950 rounded p-3 max-h-80 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}
