import type { ReactNode } from "react";

interface ChartWrapperProps {
  title?: string;
  children: ReactNode;
}

export function ChartWrapper({ title, children }: ChartWrapperProps) {
  return (
    <div className="py-2">
      {title && <p className="type-nav-label font-semibold mb-3 px-1">{title}</p>}
      {children}
    </div>
  );
}
