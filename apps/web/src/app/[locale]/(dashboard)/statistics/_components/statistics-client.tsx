"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart2, Settings2 } from "lucide-react";
import type { StatisticsQuery } from "@/lib/api/statistics";
import { useAppContext } from "@/context/app-context";
import { usePresetOverviewQuery } from "@/hooks/api/use-preset-overview-query";
import { StatisticsHeader } from "./statistics-header";
import { PresetOverviewGrid } from "./preset-layer/preset-overview-grid";
import { StatisticsSettingsModal } from "./preset-layer/statistics-settings-modal";
import type { VisibleSections } from "./_types";
import { DEFAULT_VISIBLE_SECTIONS } from "./_types";

export function StatisticsClient() {
  const t = useTranslations("Statistics");
  const { space } = useAppContext();
  const [query, setQuery] = useState<StatisticsQuery>({});
  const [hiddenDbs, setHiddenDbs] = useState<Set<string>>(new Set());
  const [hiddenProps, setHiddenProps] = useState<Record<string, Set<string>>>({});
  const [sections, setSections] = useState<VisibleSections>(DEFAULT_VISIBLE_SECTIONS);
  const [showSettings, setShowSettings] = useState(false);

  const {
    data: blocks,
    isPending,
    isError,
    refetch,
  } = usePresetOverviewQuery({
    ...query,
    spaceId: space?.id,
  });

  const visibleBlocks = blocks?.filter((b) => !hiddenDbs.has(b.databaseId));

  function toggleDb(databaseId: string) {
    setHiddenDbs((prev) => {
      const next = new Set(prev);
      if (next.has(databaseId)) next.delete(databaseId);
      else next.add(databaseId);
      return next;
    });
  }

  function toggleProp(databaseId: string, propertyName: string) {
    setHiddenProps((prev) => {
      const current = new Set(prev[databaseId] ?? []);
      if (current.has(propertyName)) current.delete(propertyName);
      else current.add(propertyName);
      return { ...prev, [databaseId]: current };
    });
  }

  function toggleSection(key: keyof VisibleSections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar px-8 py-10 animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <BarChart2 size={24} className="text-ink-secondary" />
        <h1 className="type-page-title flex-1">{t("title")}</h1>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-stroke rounded-lg text-ink-secondary hover:text-ink transition-colors duration-150"
        >
          <Settings2 size={13} />
          {t("customize")}
        </button>
      </div>

      <StatisticsHeader query={query} onChange={setQuery} />

      <PresetOverviewGrid
        blocks={visibleBlocks}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        sections={sections}
        hiddenProps={hiddenProps}
      />

      {showSettings && (
        <StatisticsSettingsModal
          blocks={blocks ?? []}
          hiddenDbs={hiddenDbs}
          hiddenProps={hiddenProps}
          sections={sections}
          onToggleDb={toggleDb}
          onToggleProp={toggleProp}
          onToggleSection={toggleSection}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
