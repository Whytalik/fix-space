"use client";

import type { SectionResponseDto } from "@nucleus/domain";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { DatabaseItem } from "../database-item/database-item";

export function SectionItem({ section }: { section: SectionResponseDto }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center gap-1 px-2 py-1 w-full rounded hover:bg-surface group"
      >
        <ChevronRight
          size={12}
          className={`text-ink-secondary shrink-0 transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
        />
        <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">{section.name}</span>
      </button>
      {!isCollapsed &&
        section.databases?.map((db) => (
          <DatabaseItem key={db.id} db={db} />
        ))}
    </div>
  );
}
