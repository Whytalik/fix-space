"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useCurrentDatabase } from "@/hooks/useCurrentDatabase";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function Breadcrumbs() {
  const { database, isDatabasePage, isRecordPage } = useCurrentDatabase();
  const t = useTranslations("Breadcrumbs");

  if (!isDatabasePage && !isRecordPage) return null;
  if (!database) return null;

  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-medium mb-1">
      {isRecordPage ? (
        <>
          <Link
            href={`/database/${database.id}`}
            className="flex items-center gap-1 text-ink-muted hover:text-ink transition-colors duration-200"
          >
            <IconDisplay value={database.icon || "📄"} size={11} />
            <span className="truncate max-w-[120px]">{database.title || database.name}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-ink-muted/30">
            <ChevronRight size={10} strokeWidth={3} />
            <div className="flex items-center gap-1 text-ink-muted/80 pointer-events-none">
              <IconDisplay value="📝" size={11} />
              <span className="truncate max-w-[150px] font-semibold">{t("record")}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1 text-ink-muted/80 select-none">
          <IconDisplay value={database.icon || "📄"} size={11} />
          <span className="truncate max-w-[150px] font-semibold uppercase tracking-wider text-[10px]">
            {t("database")}
          </span>
        </div>
      )}
    </nav>
  );
}
