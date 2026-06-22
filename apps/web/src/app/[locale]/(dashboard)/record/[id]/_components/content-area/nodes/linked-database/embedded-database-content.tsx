"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Database, X, Plus, LayoutGrid } from "lucide-react";
import type { LinkedDatabaseComponentData, LocalViewConfig } from "@fixspace/domain";
import { useDatabaseContext } from "@/context/database-context";
import { DatabaseTable } from "@/app/[locale]/(dashboard)/database/[id]/_components/database-table";
import { useUIContext } from "@/context/ui-context";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { createRecord } from "@/lib/api/record";
import { useRouter } from "@/i18n/navigation";
import { EmbeddedLocalViewTabs } from "./embedded-local-view-tabs";

interface EmbeddedDatabaseContentProps {
  data: LinkedDatabaseComponentData;
  localViews: LocalViewConfig[];
  isEditing?: boolean;
  onUpdate: (data: LinkedDatabaseComponentData) => void;
  onAddLocalView: (view: LocalViewConfig) => void;
}

export function EmbeddedDatabaseContent({ data, localViews, isEditing, onUpdate, onAddLocalView }: EmbeddedDatabaseContentProps) {
  const databaseContext = useDatabaseContext();
  const t = useTranslations("RecordPage");
  const router = useRouter();
  const { showError } = useUIContext();

  const hasViews = localViews.length > 0;

  const handleAddRecord = useCallback(async () => {
    if (!databaseContext.database) return;
    try {
      const createdRecord = await createRecord(databaseContext.database.id, {
        viewId: databaseContext.activeView?.id,
      });
      databaseContext.invalidateRecords();
      router.push(`/record/${createdRecord.id}`);
    } catch (error) {
      showError(error);
    }
  }, [databaseContext, router, showError]);

  const unlinkButton = isEditing ? (
    <button
      type="button"
      onClick={() => onUpdate({ databaseId: "", databaseName: "" })}
      className="p-1 rounded text-ink-muted hover:text-error transition-colors duration-150 shrink-0"
    >
      <X size={12} />
    </button>
  ) : null;

  const dbHeader = (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface border-b border-stroke">
      {databaseContext.database?.icon ? (
        <IconDisplay value={databaseContext.database.icon} size={14} />
      ) : (
        <Database size={14} className="text-ink-muted shrink-0" />
      )}
      <span className="text-xs font-semibold text-ink truncate flex-1">
        {databaseContext.database?.name ?? data.databaseName ?? "Database"}
      </span>
      {unlinkButton}
    </div>
  );

  if (!hasViews) {
    return (
      <div className="border border-dashed border-stroke rounded-2xl overflow-hidden">
        {dbHeader}
        <div className="p-4">
          <p className="type-nav-label mb-2">{t("selectFirstView")}</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() =>
                onAddLocalView({
                  id: crypto.randomUUID(),
                  name: t("newView", { n: 1 }),
                })
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover text-sm text-ink-secondary hover:text-ink text-left transition-colors duration-150"
            >
              <Plus size={14} className="shrink-0 text-ink-muted" />
              <span>{t("newLocalView")}</span>
            </button>

            {databaseContext.views.length > 0 && (
              <>
                <p className="text-xs text-ink-muted mt-2 mb-1 px-1">{t("copyFromExisting")}</p>
                {databaseContext.views.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() =>
                      onAddLocalView({
                        id: crypto.randomUUID(),
                        name: view.name,
                        icon: view.icon ?? undefined,
                        filters: view.filters,
                        filterLogic: view.filterLogic,
                        sort: view.sort,
                        groupBy: view.groupBy ?? undefined,
                        hiddenColumns: view.hiddenColumns,
                        columnWidths: view.columnWidths ?? undefined,
                        pageSize: view.pageSize,
                      })
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover text-sm text-ink-secondary hover:text-ink text-left transition-colors duration-150"
                  >
                    {view.icon ? <IconDisplay value={view.icon} size={14} /> : <LayoutGrid size={14} className="shrink-0 text-ink-muted" />}
                    <span className="truncate">{view.name}</span>
                  </button>
                ))}
              </>
            )}

            {databaseContext.isLoading && (
              <div className="flex justify-center py-2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-stroke rounded-2xl overflow-hidden">
      {dbHeader}
      <EmbeddedLocalViewTabs databaseId={data.databaseId} localViews={localViews} onAddLocalView={onAddLocalView} />
      <div className="overflow-y-auto max-h-[500px]">
        <DatabaseTable properties={databaseContext.properties} records={databaseContext.records} onAddRecord={handleAddRecord} />
      </div>
    </div>
  );
}
