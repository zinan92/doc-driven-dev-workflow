import type { ReactNode } from "react";

interface PanelShellProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function PanelShell({ title, children, className = "" }: PanelShellProps) {
  return (
    <section className={className}>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h2>
      {children}
    </section>
  );
}
