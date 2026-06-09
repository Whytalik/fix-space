"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Button } from "@/components/ui/primitives/actions/button";
import { useDatabaseContext } from "@/context/database-context";
import { Lock, Pencil, Zap } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { DatabaseViewTabs } from "./database-view-tabs";
import { useTranslations } from "next-intl";
import { useSpaceSettingsQuery } from "@/hooks/api/use-space-settings-query";
import { DatabaseAddButton } from "./database-add-button";

export function DatabaseHeader() {
  const t = useTranslations("DatabaseHeader");
  const router = useRouter();
  const { data: settings } = useSpaceSettingsQuery();
  const { database } = useDatabaseContext();

  if (!database) return null;

  const showPresetIcon = database.isPreset && settings?.showPresetIndicators === true;

  function handleEdit() {
    router.push(`/database/${database!.id}/edit`);
  }

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <IconDisplay value={database.icon || "📄"} size={36} />
            <h1 className="type-page-title">{database.title || database.name}</h1>
            {showPresetIcon && <Zap size={14} className="text-accent/80 shrink-0 mb-0.5" />}
            {database.isLocked && <Lock size={14} className="text-ink-muted shrink-0 mb-0.5" />}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-5 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleEdit} className="flex items-center gap-1.5">
            <Pencil size={13} />
            {t("edit")}
          </Button>
          <DatabaseAddButton />
        </div>
      </div>

      <DatabaseViewTabs />
    </div>
  );
}
