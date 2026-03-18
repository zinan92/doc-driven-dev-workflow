interface MetadataListProps {
  readonly label: string;
  readonly items: readonly string[];
}

export function MetadataList({ label, items }: MetadataListProps) {
  if (items.length === 0) return null;
  return (
    <div className="mb-2">
      <dt className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{label}</dt>
      <dd className="space-y-0.5">
        {items.map((item) => (
          <div key={item} className="text-xs font-mono text-gray-300 bg-gray-800/60 rounded px-2 py-0.5">
            {item}
          </div>
        ))}
      </dd>
    </div>
  );
}
