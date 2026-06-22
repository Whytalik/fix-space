"use client";

import { AddSectionModal } from "./components/add-section-modal";
import { AddDatabaseModal } from "@/components/database/add-database-modal";
import { useAppContext } from "@/context/app-context";
import { useModal } from "@/hooks/ui/use-modal";
import { BarChart2, FolderPlus, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function SidebarActions({ collapsed }: { collapsed?: boolean }) {
  const t = useTranslations("SidebarActions");
  const { space } = useAppContext();
  const addSection = useModal();
  const addDatabase = useModal();
  const pathname = usePathname();
  const isStatisticsActive = pathname === "/statistics";

  return (
    <div className="flex flex-col gap-0.5">
      <Link
        href="/statistics"
        title={collapsed ? t("statistics") : undefined}
        className={`flex items-center gap-2 px-2 py-1.5 h-8 rounded-lg text-sm transition-colors duration-150 w-full ${
          isStatisticsActive ? "bg-accent-muted text-accent font-medium" : "text-ink-secondary hover:bg-surface hover:text-ink"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <BarChart2 size={14} className="shrink-0" />
        {!collapsed && <span className="truncate whitespace-nowrap">{t("statistics")}</span>}
      </Link>
      <button
        type="button"
        onClick={addSection.open}
        title={collapsed ? t("addSection") : undefined}
        className={`flex items-center gap-2 px-2 py-1.5 h-8 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full ${collapsed ? "justify-center" : ""}`}
      >
        <FolderPlus size={14} className="shrink-0" />
        {!collapsed && <span className="truncate whitespace-nowrap">{t("addSection")}</span>}
      </button>
      <button
        type="button"
        onClick={addDatabase.open}
        title={collapsed ? t("addDatabase") : undefined}
        className={`flex items-center gap-2 px-2 py-1.5 h-8 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full ${collapsed ? "justify-center" : ""}`}
      >
        <LayoutGrid size={14} className="shrink-0" />
        {!collapsed && <span className="truncate whitespace-nowrap">{t("addDatabase")}</span>}
      </button>

      {addSection.isOpen && <AddSectionModal onClose={addSection.close} />}
      {space && addDatabase.isOpen && <AddDatabaseModal spaceId={space.id} onClose={addDatabase.close} onSaved={addDatabase.close} />}
    </div>
  );
}
