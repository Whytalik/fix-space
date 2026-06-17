"use client";

import { useDatabaseContext } from "@/context/database-context";
import { PropertyIcon } from "./properties/ui/property-icon";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { Search, X } from "lucide-react";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
import { useTranslations } from "next-intl";
import type { PropertyType } from "@fixspace/domain";

export function PropertyVisibilityPanelContent() {
  const { properties, activeView, setHiddenColumns, isViewLocked, relativeDates, setRelativeDates } = useDatabaseContext();
  const t = useTranslations("PropertyVisibilityPanel");
  const [search, setSearch] = useState("");

  const hiddenSet = new Set(activeView?.hiddenColumns || []);

  const filteredProperties = properties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function toggleProperty(id: string, isProtected: boolean) {
    if (isViewLocked || isProtected) return;
    const next = new Set(hiddenSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHiddenColumns(Array.from(next));
  }

  function showAll() {
    if (isViewLocked) return;
    setHiddenColumns([]);
  }

  function hideAll() {
    if (isViewLocked) return;
    const allIds = properties.filter((p) => p.position !== 0).map((p) => p.id);
    setHiddenColumns(allIds);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          {t("title") || "Properties"} {isViewLocked && <span className="text-ink-muted">({t("locked") || "Locked"})</span>}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-center gap-3">
          <CheckboxInput checked={relativeDates} onChange={(checked) => setRelativeDates(checked)} disabled={isViewLocked} />
          <span className="text-sm font-medium text-ink-secondary">{t("relativeDates")}</span>
        </div>
      </div>

      <div className="h-px bg-stroke" />

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-surface border border-stroke rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-accent/50 transition-colors duration-150"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors duration-150"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-ink-muted">{t("columns")}</span>
          {!isViewLocked && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={showAll}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-150"
              >
                {t("showAll") || "Show all"}
              </button>
              <button
                type="button"
                onClick={hideAll}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-150"
              >
                {t("hideAll") || "Hide all"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          {filteredProperties.map((prop) => {
            const isProtected = prop.position === 0;
            const isHidden = hiddenSet.has(prop.id);
            return (
              <div
                key={prop.id}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors duration-150 ${
                  isProtected ? "opacity-70 cursor-default" : "hover:bg-hover cursor-pointer"
                }`}
                onClick={() => toggleProperty(prop.id, isProtected)}
              >
                <div className="flex items-center justify-center shrink-0">
                  <CheckboxInput
                    checked={!isHidden}
                    onChange={() => toggleProperty(prop.id, isProtected)}
                    disabled={isViewLocked || isProtected}
                  />
                </div>
                <div className={`flex items-center gap-2 flex-1 min-w-0 ${isHidden ? "opacity-50" : ""}`}>
                  <span className="text-ink-muted shrink-0">
                    <PropertyIcon type={prop.type as PropertyType} size={15} />
                  </span>
                  <span className="text-sm font-medium text-ink-secondary truncate">{prop.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PropertyVisibilityPanelProps {
  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

export function PropertyVisibilityPanel({ anchorEl, onClose }: PropertyVisibilityPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFloatingPanel(containerRef, onClose, anchorEl);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
    zIndex: 9999,
  };

  return createPortal(
    <div
      ref={containerRef}
      style={panelStyle}
      className="bg-elevated border border-stroke rounded-lg shadow-lg p-3 w-64 flex flex-col gap-3 animate-fade-up max-h-[70vh] overflow-y-auto no-scrollbar"
    >
      <PropertyVisibilityPanelContent />
    </div>,
    document.body,
  );
}
