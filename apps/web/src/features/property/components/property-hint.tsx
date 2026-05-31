"use client";

import { Info } from "lucide-react";

interface PropertyHintProps {
  hint: string;
}

export function PropertyHint({ hint }: PropertyHintProps) {
  return (
    <div className="relative group shrink-0">
      <Info
        size={11}
        className="text-ink-muted group-hover:text-ink-secondary transition-colors duration-150 cursor-default"
      />
      <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="bg-surface border border-stroke rounded-md px-2.5 py-1.5 text-[11px] text-ink-secondary leading-relaxed w-48 shadow-md font-normal normal-case tracking-normal whitespace-normal">
          {hint}
        </div>
      </div>
    </div>
  );
}
