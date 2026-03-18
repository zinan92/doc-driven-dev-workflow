interface EmptyEvidenceStateProps {
  readonly purpose: string;
  readonly evidence: string | null;
}

export function EmptyEvidenceState({ purpose, evidence }: EmptyEvidenceStateProps) {
  return (
    <div className="bg-gray-900 border border-dashed border-gray-700 rounded-lg p-4 text-center">
      <p className="text-xs text-gray-400 mb-2">{purpose}</p>
      {evidence && <p className="text-xs text-gray-500 italic">{evidence}</p>}
      <p className="text-[10px] text-gray-600 mt-2">No direct artifact for this stage</p>
    </div>
  );
}
