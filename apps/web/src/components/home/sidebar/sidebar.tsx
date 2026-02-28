"use client";

import { useAppContext } from "@/context/app-context";
import { DatabaseItem } from "../database-item/database-item";
import { SectionItem } from "../section-item/section-item";
export function Sidebar() {
  const { space, isLoading } = useAppContext();

  const sections = space?.sections ?? [];
  const sectionedIds = new Set(sections.flatMap((s) => (s.databases ?? []).map((d) => d.id)));
  const unsectioned = (space?.databases ?? []).filter((d) => !sectionedIds.has(d.id));

  return (
    <aside className="w-60 shrink-0 border-r border-stroke px-3 py-6 flex flex-col gap-4 overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {sections.map((section) => (
            <SectionItem key={section.id} section={section} />
          ))}
          {unsectioned.map((db) => (
            <DatabaseItem key={db.id} db={db} />
          ))}
        </>
      )}
    </aside>
  );
}
