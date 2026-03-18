interface ArtifactTabsProps {
  readonly tabs: readonly string[];
  readonly activeTab: string;
  readonly onChangeTab: (tab: string) => void;
}

export function ArtifactTabs({ tabs, activeTab, onChangeTab }: ArtifactTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-800 mb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChangeTab(tab)}
          className={`px-3 py-1.5 text-xs font-mono transition-colors ${
            tab === activeTab
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
