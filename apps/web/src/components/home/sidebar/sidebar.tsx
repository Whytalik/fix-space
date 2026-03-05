"use client";

import { useAppContext } from "@/context/app-context";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DatabaseItem } from "../database-item/database-item";
import { SectionItem } from "../section-item/section-item";

export function Sidebar() {
  const { space } = useAppContext();
  const pathname = usePathname();

  const sections = space?.sections ?? [];
  const sectionedIds = new Set(sections.flatMap((s) => (s.databases ?? []).map((d) => d.id)));
  const unsectioned = (space?.databases ?? []).filter((d) => !sectionedIds.has(d.id));

  const isSettingsActive = pathname === "/settings";

  return (
    <aside className="w-60 shrink-0 border-r border-stroke px-3 py-6 flex flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-4 flex-1">
        {sections.map((section) => (
          <SectionItem key={section.id} section={section} />
        ))}
        {unsectioned.map((db) => (
          <DatabaseItem key={db.id} db={db} />
        ))}
      </div>

      <div className="mt-auto pt-3 border-t border-stroke">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
            isSettingsActive
              ? "bg-surface text-ink"
              : "text-ink-secondary hover:bg-surface hover:text-ink"
          }`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
