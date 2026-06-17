"use client";

import { useCallback, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Database } from "lucide-react";
import type { LinkedDatabaseComponentData, LocalViewConfig, ViewResponseDto } from "@fixspace/domain";
import { FilterLogic } from "@fixspace/domain";
import { DatabaseProvider } from "@/context/database-context";
import { useAppContext } from "@/context/app-context";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { EmbeddedDatabaseContent } from "./linked-database/embedded-database-content";

function toViewDto(localView: LocalViewConfig, databaseId: string, index: number): ViewResponseDto {
  return {
    id: localView.id,
    databaseId,
    name: localView.name,
    icon: localView.icon ?? null,
    position: index,
    isLocked: false,
    pageSize: localView.pageSize ?? 25,
    recordLimit: localView.recordLimit ?? null,
    useDefaultTemplate: localView.useDefaultTemplate ?? false,
    defaultTemplateId: localView.defaultTemplateId ?? null,
    filters: localView.filters ?? [],
    filterLogic: localView.filterLogic ?? FilterLogic.AND,
    sort: localView.sort ?? [],
    groupBy: localView.groupBy ?? null,
    hiddenColumns: localView.hiddenColumns ?? [],
    columnWidths: localView.columnWidths ?? {},
    columnSummaries: localView.columnSummaries ?? {},
    groupColors: localView.groupColors ?? {},
    hiddenGroups: localView.hiddenGroups ?? [],
    textWrap: localView.textWrap ?? false,
    relativeDates: localView.relativeDates ?? false,
    searchQuery: localView.searchQuery ?? null,
    config: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface LinkedDatabaseComponentProps {
  data: LinkedDatabaseComponentData;
  isEditing?: boolean;
  onUpdate: (data: LinkedDatabaseComponentData) => void;
}

export function LinkedDatabaseComponent({ data, isEditing, onUpdate }: LinkedDatabaseComponentProps) {
  const t = useTranslations("RecordPage");
  const { databases } = useAppContext();

  const uniqueDatabases = useMemo(() => {
    const seen = new Set<string>();
    return databases.filter((database) => {
      if (seen.has(database.id)) return false;
      seen.add(database.id);
      return true;
    });
  }, [databases]);

  const localViews = useMemo((): LocalViewConfig[] => {
    if (data.views?.length) return data.views;
    if (data.localView) return [{ ...data.localView, name: data.localView.name ?? t("localView") }];
    return [];
  }, [data.views, data.localView, t]);

  const activeViewId = data.activeViewId ?? localViews[0]?.id ?? null;
  const hasViews = localViews.length > 0;

  const viewDtos = useMemo(
    () => localViews.map((localView, index) => toViewDto(localView, data.databaseId, index)),
    [localViews, data.databaseId],
  );

  const handleViewUpdate = useCallback(
    async (viewId: string, patch: Partial<ViewResponseDto>) => {
      const nextViews = localViews.map((view) => (view.id === viewId ? { ...view, ...patch } : view));
      onUpdate({ ...data, views: nextViews });
    },
    [data, localViews, onUpdate],
  );

  const handleViewCreate = useCallback(
    async (name: string): Promise<ViewResponseDto> => {
      const newId = crypto.randomUUID();
      const newView: LocalViewConfig = { id: newId, name };
      const nextViews = [...localViews, newView];
      onUpdate({ ...data, views: nextViews, activeViewId: newId });
      return toViewDto(newView, data.databaseId, nextViews.length - 1);
    },
    [data, localViews, onUpdate],
  );

  const handleViewDelete = useCallback(
    async (viewId: string) => {
      const nextViews = localViews.filter((view) => view.id !== viewId);
      const nextActiveId = activeViewId === viewId ? (nextViews[0]?.id ?? undefined) : (activeViewId ?? undefined);
      onUpdate({ ...data, views: nextViews, activeViewId: nextActiveId });
    },
    [data, localViews, activeViewId, onUpdate],
  );

  const handleViewDuplicate = useCallback(
    async (viewId: string): Promise<ViewResponseDto> => {
      const sourceView = localViews.find((view) => view.id === viewId);
      if (!sourceView) throw new Error("View not found");
      const newId = crypto.randomUUID();
      const newView: LocalViewConfig = { ...sourceView, id: newId, name: `${sourceView.name} (2)` };
      const nextViews = [...localViews, newView];
      onUpdate({ ...data, views: nextViews, activeViewId: newId });
      return toViewDto(newView, data.databaseId, nextViews.length - 1);
    },
    [data, localViews, onUpdate],
  );

  const handleViewsReorder = useCallback(
    async (orders: { id: string; position: number }[]): Promise<ViewResponseDto[]> => {
      const sorted = [...orders].sort((a, b) => a.position - b.position);
      const reordered = sorted.map((order) => localViews.find((view) => view.id === order.id)!).filter(Boolean);
      onUpdate({ ...data, views: reordered });
      return reordered.map((view, index) => toViewDto(view, data.databaseId, index));
    },
    [data, localViews, onUpdate],
  );

  const handleAddLocalView = useCallback(
    (newView: LocalViewConfig) => {
      const nextViews = [...localViews, newView];
      onUpdate({ ...data, views: nextViews, activeViewId: newView.id });
    },
    [data, localViews, onUpdate],
  );

  if (!data.databaseId) {
    return (
      <div className="border border-dashed border-stroke rounded-2xl p-4">
        <p className="type-nav-label mb-2">{t("selectDatabase")}</p>
        <div className="flex flex-col gap-1">
          {uniqueDatabases.map((database) => (
            <button
              key={database.id}
              type="button"
              onClick={() => onUpdate({ databaseId: database.id, databaseName: database.name })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover text-sm text-ink-secondary hover:text-ink text-left transition-colors duration-150"
            >
              {database.icon ? <IconDisplay value={database.icon} size={14} /> : <Database size={14} className="shrink-0 text-ink-muted" />}
              <span className="truncate">{database.name || "Untitled"}</span>
            </button>
          ))}
          {uniqueDatabases.length === 0 && <p className="text-xs text-ink-muted italic">{t("noDatabasesAvailable")}</p>}
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="py-6 flex justify-center">
          <Spinner size="sm" />
        </div>
      }
    >
      <DatabaseProvider
        skipStateUpdate={true}
        databaseId={data.databaseId}
        views={hasViews ? viewDtos : undefined}
        activeViewId={hasViews ? activeViewId : undefined}
        onActiveViewChange={hasViews ? (viewId) => onUpdate({ ...data, activeViewId: viewId }) : undefined}
        onViewUpdate={hasViews ? handleViewUpdate : undefined}
        onViewCreate={handleViewCreate}
        onViewDelete={hasViews ? handleViewDelete : undefined}
        onViewDuplicate={hasViews ? handleViewDuplicate : undefined}
        onViewsReorder={hasViews ? handleViewsReorder : undefined}
      >
        <EmbeddedDatabaseContent
          data={data}
          localViews={localViews}
          isEditing={isEditing}
          onUpdate={onUpdate}
          onAddLocalView={handleAddLocalView}
        />
      </DatabaseProvider>
    </Suspense>
  );
}
