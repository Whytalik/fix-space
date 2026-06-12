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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !menuAnchorEl?.contains(e.target as Node)) {
        setMenuOpenId(null);
        setMenuAnchorEl(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpenId(null);
        setMenuAnchorEl(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuAnchorEl]);

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

  const activeSettingsCount = sorts.length + filters.length + (group ? 1 : 0);

  return (
    <>
      <div className="flex items-center border-b border-stroke">
        <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth">
          {views.map((view) => (
            <div
              key={view.id}
              className={cn(
                "group relative flex items-center h-10 px-4 border-b-2 transition-colors duration-150 cursor-pointer min-w-fit",
                activeView?.id === view.id
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-ink-secondary hover:text-ink hover:bg-canvas-subtle",
              )}
              onClick={() => setActiveView(view.id)}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                {view.icon && <IconDisplay value={view.icon} size={13} />}
                {view.name}
                {view.isLocked && <Lock size={12} className="ml-0.5 opacity-60" />}
              </span>

              {activeView?.id === view.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (menuOpenId === view.id) {
                      setMenuOpenId(null);
                      setMenuAnchorEl(null);
                    } else {
                      setMenuOpenId(view.id);
                      setMenuAnchorEl(e.currentTarget.parentElement as HTMLElement);
                    }
                  }}
                  className={cn(
                    "ml-2 p-0.5 rounded hover:bg-black/5 transition-opacity",
                    menuOpenId === view.id ? "opacity-100 bg-black/10" : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  <MoreHorizontal size={14} />
                </button>
              )}

              {menuOpenId === view.id &&
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
                        setMenuOpenId(null);
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
                      onClick={() => handleDuplicate(view.id)}
                      disabled={views.length >= 5}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <Copy size={14} className="text-ink-muted" />
                      {t("duplicate")}
                    </button>
                    <button
                      onClick={() => handleToggleLock(view.id, view.isLocked)}
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
                      onClick={() => handleDelete(view.id)}
                      disabled={views.length <= 1}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <Trash size={14} />
                      {t("delete")}
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
          ))}

          {views.length < 5 && (
            <button
              onClick={handleAddView}
              className="flex items-center justify-center h-10 w-10 text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors duration-150"
              title={t("addView")}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        <div className="relative flex items-center ml-auto mr-2">
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
