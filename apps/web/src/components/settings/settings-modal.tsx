"use client";

import { useAppContext } from "@/context/app-context";
import { useUIContext, type SettingsCategory } from "@/context/ui-context";
import { useEscape } from "@/hooks/ui/use-escape";
import { Button } from "@/components/ui/primitives/actions/button";
import { ProfileSettings } from "./profile-settings";
import { SpaceSettings } from "./space-settings";
import { AppearanceSettings } from "./appearance-settings";
import { DatabaseSettings } from "./database-settings";
import { TemplateSettings } from "./template-settings";
import { RecordSettings } from "./record-settings";
import { SectionSettings } from "./section-settings";
import { IntegrationSettings } from "./integration-settings";
import { ViewSettings } from "./view-settings";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { SETTINGS_CATEGORIES } from "./settings-categories";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, isLoading } = useAppContext();
  const { settingsCategory } = useUIContext();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(settingsCategory);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("SettingsModal");

  useEffect(() => setMounted(true), []);

  useEscape(onClose);

  if (isLoading || !user || !mounted) return null;

  const categories = SETTINGS_CATEGORIES.map((cat) => ({ ...cat, label: t(cat.i18nKey) }));

  const activeLabel = categories.find((category) => category.id === activeCategory)?.label ?? "";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={onClose}>
      <div
        className="flex w-215 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg animate-fade-up"
        style={{ height: "min(800px, calc(100vh - 80px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="flex w-52 shrink-0 flex-col border-r border-stroke bg-surface py-5">
          <p className="mb-3 px-4 type-nav-label">{t("settings")}</p>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  activeCategory === id ? "bg-elevated text-ink" : "text-ink-secondary hover:bg-elevated hover:text-ink"
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
              <p className="mt-0.5 text-sm text-ink-secondary">{t("manageSettings", { label: activeLabel.toLowerCase() })}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar">
            {activeCategory === "profile" && <ProfileSettings compact />}
            {activeCategory === "appearance" && <AppearanceSettings />}
            {activeCategory === "space" && <SpaceSettings />}
            {activeCategory === "section" && <SectionSettings />}
            {activeCategory === "database" && <DatabaseSettings />}
            {activeCategory === "view" && <ViewSettings />}
            {activeCategory === "template" && <TemplateSettings />}
            {activeCategory === "record" && <RecordSettings />}
            {activeCategory === "integration" && <IntegrationSettings />}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
