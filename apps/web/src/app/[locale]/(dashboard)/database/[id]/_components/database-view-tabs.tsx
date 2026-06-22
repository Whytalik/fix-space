"use client";

import { useDatabaseContext } from "@/context/database-context";
import { Plus, MoreHorizontal, Copy, Lock, Unlock, Trash, Settings2, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/ui/cn";
import { useUIContext } from "@/context/ui-context";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ViewSettingsModal } from "./view-settings-modal";
import { Button } from "@/components/ui/primitives/actions/button";
import { useClickOutside } from "@/hooks/ui/use-click-outside";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";

function DatabaseViewTab({
  view,
  isActive,
  isMenuOpen,
  menuAnchorEl,
  menuRef,
  onSelect,
  onMenuToggle,
  onDuplicate,
  onToggleLock,
  onDelete,
  t,
  tToolbar,
  activeSettingsCount,
  setViewSettingsOpen,
}: {
  view: { id: string; name: string; icon?: string | null; isLocked: boolean };
  isActive: boolean;
  isMenuOpen: boolean;
  menuAnchorEl: HTMLElement | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onMenuToggle: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  t: (key: string) => string;
  tToolbar: (key: string) => string;
  activeSettingsCount: number;
  setViewSettingsOpen: (open: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: view.id,
    data: { type: "view" },
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: view.id,
    data: { type: "view" },
  });

  return (
    <div
      ref={setDropRef}
      className={cn(
        "group relative flex items-center h-10 px-4 border-b-2 transition-colors duration-150 cursor-pointer min-w-fit",
        isActive ? "border-accent text-accent bg-accent/5" : "border-transparent text-ink-secondary hover:text-ink hover:bg-canvas-subtle",
        isOver && !isDragging && "border-t-2 border-t-accent border-b-transparent",
      )}
      onClick={onSelect}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn("flex items-center gap-1.5 text-sm font-medium whitespace-nowrap select-none touch-none", isDragging && "opacity-30")}
      >
        {view.icon && <IconDisplay value={view.icon} size={13} />}
        {view.name}
        {view.isLocked && <Lock size={12} className="ml-0.5 opacity-60" />}
      </div>

      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(e);
          }}
          className={cn(
            "ml-2 p-0.5 rounded hover:bg-black/5 transition-opacity",
            isMenuOpen ? "opacity-100 bg-black/10" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <MoreHorizontal size={14} />
        </button>
      )}

      {isMenuOpen &&
        menuAnchorEl &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuAnchorEl.getBoundingClientRect().bottom + 4,
              left: menuAnchorEl.getBoundingClientRect().left,
              zIndex: 9999,
            }}
            className="w-56 bg-canvas border border-stroke rounded-lg shadow-elevated py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setViewSettingsOpen(true);
                onMenuToggle({} as React.MouseEvent);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              <Settings2 size={14} className="text-ink-muted" />
              {tToolbar("viewSettings")}
              {activeSettingsCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-tiny font-bold leading-none">
                  {activeSettingsCount}
                </span>
              )}
            </button>
            <div className="h-px bg-stroke my-1" />
            <button
              onClick={onDuplicate}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              <Copy size={14} className="text-ink-muted" />
              {t("duplicate")}
            </button>
            <button
              onClick={onToggleLock}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              {view.isLocked ? (
                <>
                  <Unlock size={14} className="text-ink-muted" />
                  {t("unlock")}
                </>
              ) : (
                <>
                  <Lock size={14} className="text-ink-muted" />
                  {t("lock")}
                </>
              )}
            </button>
            <div className="h-px bg-stroke my-1" />
            <button
              onClick={onDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors duration-150"
            >
              <Trash size={14} />
              {t("delete")}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function DatabaseViewTabs() {
  const t = useTranslations("DatabaseViewTabs");
  const tToolbar = useTranslations("DatabaseToolbar");
  const {
    views,
    activeView,
    setActiveView,
    createView,
    updateActiveView,
    deleteView,
    duplicateView,
    reorderViews,
    sorts,
    filters,
    group,
    search,
    setSearch,
  } = useDatabaseContext();
  const { showConfirm, showError } = useUIContext();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const [searchOpen, setSearchOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [inputValue, setInputValue] = useState(search);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useClickOutside(searchContainerRef, () => {
    if (searchOpen) {
      setSearchOpen(false);
    }
  });

  useEffect(() => {
    if (search === "") {
      setInputValue("");
    }
  }, [search]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setSearchOpen(false);
    }
    if (e.key === "Escape") {
      clearSearch();
    }
  }

  function clearSearch() {
    setInputValue("");
    setSearch("");
    setSearchOpen(false);
  }

  async function handleAddView() {
    try {
      if (views.length >= 5) return;
      await createView(t("newView"));
    } catch (error) {
      showError(error);
    }
  }

  async function handleToggleLock(id: string, locked: boolean) {
    try {
      await updateActiveView({ isLocked: !locked });
      setMenuOpenId(null);
    } catch (error) {
      showError(error);
    }
  }

  async function handleDelete(id: string) {
    if (views.length <= 1) return;

    showConfirm({
      title: t("deleteViewTitle"),
      message: t("deleteViewMessage"),
      onConfirm: async () => {
        try {
          await deleteView(id);
        } catch (error) {
          showError(error);
        }
      },
    });
    setMenuOpenId(null);
  }

  async function handleDuplicate(id: string) {
    try {
      if (views.length >= 5) return;
      await duplicateView(id);
      setMenuOpenId(null);
    } catch (error) {
      showError(error);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ordered = views.map((v) => v.id);
    const fromIdx = ordered.indexOf(active.id as string);
    const toIdx = ordered.indexOf(over.id as string);
    ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, active.id as string);
    reorderViews(ordered.map((id, i) => ({ id, position: i })));
  }

  const activeSettingsCount = sorts.length + filters.length + (group ? 1 : 0);

  return (
    <>
      <div className="flex items-center border-b border-stroke">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth">
            {views.map((view) => (
              <DatabaseViewTab
                key={view.id}
                view={view}
                isActive={activeView?.id === view.id}
                isMenuOpen={menuOpenId === view.id}
                menuAnchorEl={menuAnchorEl}
                menuRef={menuRef}
                onSelect={() => setActiveView(view.id)}
                onMenuToggle={(e) => {
                  if (menuOpenId === view.id) {
                    setMenuOpenId(null);
                    setMenuAnchorEl(null);
                  } else {
                    setMenuOpenId(view.id);
                    setMenuAnchorEl(e.currentTarget?.parentElement as HTMLElement);
                  }
                }}
                onDuplicate={() => handleDuplicate(view.id)}
                onToggleLock={() => handleToggleLock(view.id, view.isLocked)}
                onDelete={() => handleDelete(view.id)}
                t={t}
                tToolbar={tToolbar}
                activeSettingsCount={activeSettingsCount}
                setViewSettingsOpen={setViewSettingsOpen}
              />
            ))}

            {views.length < 5 && (
              <button
                onClick={handleAddView}
                className="flex items-center justify-center h-10 w-10 text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors duration-150 shrink-0"
                title={t("addView")}
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </DndContext>

        <div className="relative flex items-center ml-auto mr-2 shrink-0">
          {searchOpen ? (
            <div ref={searchContainerRef} className="flex items-center gap-1 border border-stroke rounded-lg px-2 py-1 bg-canvas">
              <Search size={13} className="text-ink-muted shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={tToolbar("searchPlaceholder")}
                className="text-xs text-ink bg-transparent outline-none w-40 placeholder:text-ink-muted"
              />
              <button type="button" onClick={clearSearch} className="text-ink-muted hover:text-ink transition-colors duration-150">
                <X size={13} />
              </button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
              <Search size={13} />
              {search ? search : tToolbar("search")}
            </Button>
          )}
        </div>
      </div>
      <ViewSettingsModal isOpen={viewSettingsOpen} onClose={() => setViewSettingsOpen(false)} />
    </>
  );
}
