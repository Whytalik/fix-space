import * as React from "react";

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

export function Section({ label, children }: SectionProps) {
  return (
    <div>
      <p className="type-nav-label mb-2">{label}</p>
      {children}
    </div>
  );
}
