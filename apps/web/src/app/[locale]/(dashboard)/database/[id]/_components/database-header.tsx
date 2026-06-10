"use client";

import { useRef, useState } from "react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Button } from "@/components/ui/primitives/actions/button";
import { useDatabaseContext } from "@/context/database-context";
import { Download, Lock, MoreHorizontal, Pencil, Upload, Workflow, Zap } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { DatabaseViewTabs } from "./database-view-tabs";
import { useTranslations } from "next-intl";
import { useSpaceSettingsQuery } from "@/hooks/api/use-space-settings-query";
import { DatabaseAddButton } from "./database-add-button";
import { ImportCsvModal } from "@/components/database/import-csv-modal";
import { ExportCsvModal } from "@/components/database/export-csv-button";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";

export function DatabaseHeader() {
  const t = useTranslations("DatabaseHeader");
  const router = useRouter();
  const { data: settings } = useSpaceSettingsQuery();
  const { database, activeView, filters } = useDatabaseContext();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  if (!database) return null;

  const showPresetIcon = database.isPreset && settings?.showPresetIndicators === true;

  function handleEdit() {
    router.push(`/database/${database!.id}/edit`);
  }

  const moreItems = [
    {
      label: "Automations",
      icon: <Workflow size={13} />,
      onClick: () => router.push(`/database/${database!.id}/automations`),
    },
    {
      label: t("export"),
      icon: <Download size={13} />,
      onClick: () => setIsExportOpen(true),
    },
    {
      label: t("import"),
      icon: <Upload size={13} />,
      onClick: () => setIsImportOpen(true),
    },
  ];

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
          <Button ref={moreButtonRef} variant="secondary" size="sm" onClick={() => setIsMoreOpen((isOpen) => !isOpen)}>
            <MoreHorizontal size={15} />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleEdit} className="flex items-center gap-1.5">
            <Pencil size={13} />
            {t("edit")}
          </Button>
          <DatabaseAddButton />
        </div>
      </div>

      <DatabaseViewTabs />

      {isMoreOpen && <DropdownMenu items={moreItems} anchorEl={moreButtonRef.current} onClose={() => setIsMoreOpen(false)} />}

      <ImportCsvModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} databaseId={database.id} />
      <ExportCsvModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        databaseId={database.id}
        activeViewId={activeView?.id}
        activeFiltersCount={filters.length}
      />
    </div>
  );
}
