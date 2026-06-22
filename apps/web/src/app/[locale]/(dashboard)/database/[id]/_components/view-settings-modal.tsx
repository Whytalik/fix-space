"use client";

import { useDatabaseContext } from "@/context/database-context";
import { useEscape } from "@/hooks/ui/use-escape";
import { Button } from "@/components/ui/primitives/actions/button";
import { ArrowUpDown, Filter, Layers, Columns, Monitor, Settings, Shield, X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useTranslations } from "next-intl";
import { SortPanelContent } from "./sort-panel";
import { FilterPanelContent } from "./filter-panel";
import { GroupPanelContent } from "./group-panel";
import { PropertyVisibilityPanelContent } from "./property-visibility-panel";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import type { ViewResponseDto } from "@fixspace/domain";

import { Combobox } from "@/components/ui/primitives/inputs/combobox";

type TabId = "general" | "filter" | "sort" | "group" | "columns" | "display" | "limits";

interface ViewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewSettingsModal({ isOpen, onClose }: ViewSettingsModalProps) {
  const { database, activeView, updateActiveView, group, setGroup, wrapCells, setWrapCells } = useDatabaseContext();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [mounted, setMounted] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [viewName, setViewName] = useState(activeView?.name ?? "");
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("DatabaseToolbar");
  const { data: templates = [] } = useTemplatesQuery(database?.id || "");

  useEffect(() => {
    setViewName(activeView?.name ?? "");
  }, [activeView?.id, activeView?.name]);

  useEffect(() => setMounted(true), []);
  useEscape(onClose);

  const tabs = useMemo(
    () => [
      { id: "general" as const, label: t("general"), icon: Settings },
      { id: "filter" as const, label: t("filter"), icon: Filter },
      { id: "sort" as const, label: t("sort"), icon: ArrowUpDown },
      { id: "group" as const, label: t("group"), icon: Layers },
      { id: "columns" as const, label: t("properties"), icon: Columns },
      { id: "display" as const, label: t("display"), icon: Monitor },
      { id: "limits" as const, label: t("limits"), icon: Shield },
    ],
    [t],
  );

  if (!isOpen || !mounted) return null;

  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "";

  const handleUpdateView = (data: Partial<ViewResponseDto>) => {
    updateActiveView(data);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={onClose}>
      <div
        className="flex w-215 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        style={{ height: "min(800px, calc(100vh - 80px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="flex w-52 shrink-0 flex-col border-r border-stroke bg-surface py-5">
          <p className="mb-3 px-4 type-nav-label">{t("viewSettings")}</p>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  activeTab === id ? "bg-elevated text-ink" : "text-ink-secondary hover:bg-elevated hover:text-ink"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-stroke px-8 pb-4 pt-5">
            <div>
              <h1 className="type-panel-title tracking-[-0.03em]">{activeLabel}</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">{t("manageSettingsDesc", { label: activeLabel.toLowerCase() })}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <label className="block mb-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">{t("viewIcon")}</label>
                    <button
                      ref={iconButtonRef}
                      type="button"
                      onClick={() => setShowIconPicker((prev) => !prev)}
                      className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
                    >
                      {activeView?.icon ? (
                        <IconDisplay value={activeView.icon} size={18} />
                      ) : (
                        <span className="text-ink-muted">{t("chooseIcon")}</span>
                      )}
                    </button>
                    {showIconPicker && (
                      <IconPicker
                        value={activeView?.icon ?? ""}
                        onChange={(value) => {
                          handleUpdateView({ icon: value });
                          setShowIconPicker(false);
                        }}
                        onClose={() => setShowIconPicker(false)}
                        anchorEl={iconButtonRef.current}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block mb-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">{t("name")}</label>
                    <input
                      type="text"
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      onBlur={() => {
                        const trimmed = viewName.trim();
                        if (trimmed && trimmed !== activeView?.name) handleUpdateView({ name: trimmed });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setViewName(activeView?.name ?? "");
                      }}
                      maxLength={255}
                      placeholder={t("viewNamePlaceholder")}
                      className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent transition-colors duration-150"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "filter" && <FilterPanelContent />}
            {activeTab === "sort" && <SortPanelContent />}
            {activeTab === "group" && <GroupPanelContent grouping={group ?? null} onChange={(grouping) => setGroup(grouping)} />}
            {activeTab === "columns" && <PropertyVisibilityPanelContent />}
            {activeTab === "display" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between py-2 border-b border-stroke">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-ink">{t("wrap")}</span>
                    <span className="text-xs text-ink-muted">{t("wrapCells")}</span>
                  </div>
                  <Toggle value={wrapCells} onChange={setWrapCells} />
                </div>
              </div>
            )}
            {activeTab === "limits" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink">{t("recordLimit")}</label>
                  <Combobox
                    options={[
                      { value: "", label: t("unlimited") },
                      { value: "10", label: "10" },
                      { value: "25", label: "25" },
                      { value: "50", label: "50" },
                      { value: "100", label: "100" },
                      { value: "200", label: "200" },
                      { value: "500", label: "500" },
                    ]}
                    value={activeView?.recordLimit === null ? "" : String(activeView?.recordLimit)}
                    onChange={(value) => handleUpdateView({ recordLimit: value === "" ? null : Number(value) })}
                    placeholder={t("unlimited")}
                    freeText
                  />
                  <span className="text-xs text-ink-muted">{t("recordLimitDesc")}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-ink">{t("defaultTemplate")}</span>
                      <span className="text-xs text-ink-muted">{t("defaultTemplateDesc")}</span>
                    </div>
                    <Toggle
                      value={activeView?.useDefaultTemplate ?? true}
                      onChange={(value) => handleUpdateView({ useDefaultTemplate: value })}
                    />
                  </div>

                  {(activeView?.useDefaultTemplate ?? true) && (
                    <Combobox
                      options={[
                        { value: "", label: t("noTemplate") },
                        ...templates.map((temp) => ({
                          value: temp.id,
                          label: temp.name,
                          icon: temp.icon,
                        })),
                      ]}
                      value={activeView?.defaultTemplateId || ""}
                      onChange={(value) => handleUpdateView({ defaultTemplateId: value || null })}
                      placeholder={t("noTemplate")}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
