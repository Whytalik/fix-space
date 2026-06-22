import { Info } from "lucide-react";

interface PropertyHintProps {
  hint: string;
}

export function PropertyHint({ hint }: PropertyHintProps) {
  return (
    <div className="relative group/hint shrink-0">
      <div className="p-0.5 -m-0.5 rounded-full hover:bg-hover transition-colors duration-150 cursor-help">
        <Info size={12} className="text-ink-muted group-hover/hint:text-ink-secondary transition-colors duration-150" />
      </div>
      <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[70] opacity-0 group-hover/hint:opacity-100 transition-opacity duration-150">
        <div className="bg-surface border border-stroke rounded-md px-2.5 py-1.5 text-xs text-ink-secondary leading-relaxed w-48 shadow-md font-normal normal-case tracking-normal whitespace-normal">
          {hint}
        </div>
      </div>
    </div>
  );
}
