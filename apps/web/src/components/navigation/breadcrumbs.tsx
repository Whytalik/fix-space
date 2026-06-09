"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useAppContext } from "@/context/app-context";
import { Link, usePathname } from "@/i18n/navigation";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { ChevronRight, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { databases } = useAppContext();
  const t = useTranslations("DatabaseTable");

  const dbMatch = pathname.match(/\/database\/([^/]+)/);
  const dbIdFromPath = dbMatch ? dbMatch[1] : null;

  const recordMatch = pathname.match(/\/record\/([^/]+)/);
  const recordId = recordMatch ? recordMatch[1] : null;

  const { data: record } = useRecordQuery(recordId || "", { enabled: !!recordId });

  const databaseId = record?.databaseId || dbIdFromPath;
  const database = databaseId ? databases.find((db) => db.id === databaseId) : null;

  if (!database) return null;

  return (
    <nav className="flex items-center gap-1.5 mt-2 mb-1 whitespace-nowrap overflow-hidden">
      <Link
        href={`/database/${database.id}`}
        className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors duration-150"
      >
        <IconDisplay value={database.icon || "📄"} size={14} />
        <span className="type-nav-label truncate max-w-[200px] font-medium text-inherit">{database.title || database.name}</span>
      </Link>

      {record && (
        <>
          <ChevronRight size={12} className="text-ink-muted shrink-0" />
          <div className="flex items-center gap-1.5 text-ink transition-colors duration-150">
            {record.icon ? <IconDisplay value={record.icon} size={14} /> : <FileText size={14} className="text-ink-muted" />}
            <span className="type-nav-label truncate max-w-[200px] font-bold text-inherit">{record.name || t("untitled")}</span>
          </div>
        </>
      )}
    </nav>
  );
}
