"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useAppContext } from "@/context/app-context";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { databases } = useAppContext();
  const t = useTranslations("Breadcrumbs");

  const match = pathname.match(/\/database\/([^/]+)/);
  const dbId = match ? match[1] : null;
  const database = dbId ? databases.find((d) => d.id === dbId) : null;

  if (!database) return null;

  return (
    <nav className="flex items-center gap-1.5 type-nav-label mb-1">
      <div className="flex items-center gap-1 text-ink-muted/80 select-none">
        <IconDisplay value={database.icon || "📄"} size={14} />
        <span className="truncate max-w-[150px] font-semibold uppercase tracking-wider type-hint">{t("database")}</span>
      </div>
    </nav>
  );
}
