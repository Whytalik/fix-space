"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Plus, LayoutGrid, ChevronRight, Search, X, MoreHorizontal } from "lucide-react";
import type { LocalViewConfig, ViewResponseDto } from "@fixspace/domain";
import { useDatabaseContext } from "@/context/database-context";
import { useViewsQuery } from "@/hooks/api/use-views-query";
import { useClickOutside } from "@/hooks/ui/use-click-outside";
import { cn } from "@/utils/ui/cn";
import { IconDisplay } from "@/components/ui/icons/icon-display";

interface EmbeddedLocalViewTabsProps {
  databaseId: string;
  localViews: LocalViewConfig[];
  onAddLocalView: (view: LocalViewConfig) => void;
}

export function EmbeddedLocalViewTabs({ databaseId, localViews, onAddLocalView }: EmbeddedLocalViewTabsProps) {
  const databaseContext = useDatabaseContext();
  const t = useTranslations("RecordPage");

  const { data: globalViews = [] } = useViewsQuery(databaseId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorElement, setMenuAnchorElement] = useState<HTMLElement | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const menuReference = useRef<HTMLDivElement>(null);
  const addReference = useRef<HTMLDivElement>(null);
  const renameInputReference = useRef<HTMLInputElement>(null);
  const searchReference = useRef<HTMLInputElement>(null);
  const debounceTimerReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  useClickOutside(menuReference, () => {
    setMenuOpen(false);
    setMenuAnchorElement(null);
  });
  useClickOutside(addReference, () => {
    setAddOpen(false);
    setCopyMenuOpen(false);
  });

  useEffect(() => {
    if (renamingId && renameInputReference.current) {
      renameInputReference.current.focus();
      renameInputReference.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    if (searchOpen) searchReference.current?.focus();
  }, [searchOpen]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceTimerReference.current) clearTimeout(debounceTimerReference.current);
    debounceTimerReference.current = setTimeout(() => databaseContext.setSearch(value), 300);
  }

  function clearSearch() {
    setSearchValue("");
    databaseContext.setSearch("");
    setSearchOpen(false);
  }

  function startRename(view: LocalViewConfig) {
    setRenamingId(view.id);
    setRenameValue(view.name);
    setMenuOpen(false);
    setMenuAnchorElement(null);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      databaseContext.updateActiveView({ name: renameValue.trim() });
    }
    setRenamingId(null);
  }

  function handleRenameKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") setRenamingId(null);
  }

  async function handleDelete(viewId: string) {
    setMenuOpen(false);
    setMenuAnchorElement(null);
    await databaseContext.deleteView(viewId);
  }

  function handleNewEmpty() {
    databaseContext.createView(t("newView", { n: localViews.length + 1 }));
    setAddOpen(false);
  }

  function handleCopyFrom(globalView: ViewResponseDto) {
    onAddLocalView({
      id: crypto.randomUUID(),
      name: globalView.name,
      icon: globalView.icon ?? undefined,
      filters: globalView.filters,
      filterLogic: globalView.filterLogic,
      sort: globalView.sort,
      groupBy: globalView.groupBy ?? undefined,
      hiddenColumns: globalView.hiddenColumns,
      columnWidths: globalView.columnWidths ?? undefined,
      pageSize: globalView.pageSize,
    });
    setAddOpen(false);
    setCopyMenuOpen(false);
  }

  const activeViewId = databaseContext.activeView?.id;

  return (
    <div className="flex items-center border-b border-stroke bg-canvas">
      <div className="flex items-center overflow-x-auto no-scrollbar flex-1 min-w-0">
        {localViews.map((view) => {
          const isActive = activeViewId === view.id;
          const isRenaming = renamingId === view.id;
          return (
            <div
              key={view.id}
              onClick={() => {
                if (!isRenaming) databaseContext.setActiveView(view.id);
              }}
              className={cn(
                "group/tab relative flex items-center h-10 px-4 border-b-2 transition-colors duration-150 cursor-pointer min-w-fit shrink-0",
                isActive
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-ink-secondary hover:text-ink hover:bg-canvas-subtle",
              )}
            >
              {view.icon && (
                <span className="mr-1.5 shrink-0">
                  <IconDisplay value={view.icon} size={13} />
                </span>
              )}
              {isRenaming ? (
                <input
                  ref={renameInputReference}
                  type="text"
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={commitRename}
                  onClick={(event) => event.stopPropagation()}
                  placeholder={t("viewNamePlaceholder")}
                  className="text-sm font-medium bg-transparent border-none outline-none w-28 text-ink"
                />
              ) : (
                <span className="text-sm font-medium whitespace-nowrap select-none">{view.name}</span>
              )}
              {isActive && !isRenaming && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAnchorElement(event.currentTarget);
                    setMenuOpen((prev) => !prev);
                  }}
                  className={cn(
                    "ml-2 p-0.5 rounded hover:bg-black/5 transition-opacity",
                    menuOpen ? "opacity-100 bg-black/10" : "opacity-0 group-hover/tab:opacity-100",
                  )}
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative shrink-0" ref={addReference}>
        <button
          onClick={() => setAddOpen((prev) => !prev)}
          className="flex items-center justify-center h-10 w-10 text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors duration-150"
          title={t("addView")}
        >
          <Plus size={16} />
        </button>
        {addOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-canvas border border-stroke rounded-lg shadow-elevated py-1 z-50">
            <button
              onClick={handleNewEmpty}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              <Plus size={14} className="text-ink-muted shrink-0" />
              {t("newEmptyView")}
            </button>
            {globalViews.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setCopyMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                >
                  <LayoutGrid size={14} className="text-ink-muted shrink-0" />
                  <span className="flex-1 text-left">{t("copyFrom")}</span>
                  <ChevronRight size={12} className="text-ink-muted" />
                </button>
                {copyMenuOpen && (
                  <div className="absolute right-full top-0 mr-1 w-48 bg-canvas border border-stroke rounded-lg shadow-elevated py-1 z-50">
                    {globalViews.map((globalView) => (
                      <button
                        key={globalView.id}
                        onClick={() => handleCopyFrom(globalView)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                      >
                        {globalView.icon ? (
                          <IconDisplay value={globalView.icon} size={14} />
                        ) : (
                          <LayoutGrid size={14} className="shrink-0 text-ink-muted" />
                        )}
                        <span className="truncate">{globalView.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center mr-2 shrink-0">
        {searchOpen ? (
          <div className="flex items-center gap-1 border border-stroke rounded-lg px-2 py-1 bg-canvas">
            <Search size={13} className="text-ink-muted shrink-0" />
            <input
              ref={searchReference}
              type="text"
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") clearSearch();
              }}
              className="text-xs text-ink bg-transparent outline-none w-32 placeholder:text-ink-muted"
            />
            <button onClick={clearSearch} className="text-ink-muted hover:text-ink transition-colors duration-150">
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center h-8 w-8 text-ink-muted hover:text-ink hover:bg-canvas-subtle rounded-lg transition-colors duration-150"
          >
            <Search size={13} />
          </button>
        )}
      </div>

      {menuOpen &&
        menuAnchorElement &&
        createPortal(
          <div
            ref={menuReference}
            style={{
              position: "fixed",
              top: menuAnchorElement.getBoundingClientRect().bottom + 4,
              left: menuAnchorElement.getBoundingClientRect().left,
              zIndex: 9999,
            }}
            className="w-40 bg-canvas border border-stroke rounded-lg shadow-elevated py-1"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                const view = localViews.find((localView) => localView.id === activeViewId);
                if (view) startRename(view);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              {t("renameView")}
            </button>
            <div className="h-px bg-stroke my-1" />
            <button
              onClick={() => activeViewId && handleDelete(activeViewId)}
              disabled={localViews.length <= 1}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("deleteView")}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
