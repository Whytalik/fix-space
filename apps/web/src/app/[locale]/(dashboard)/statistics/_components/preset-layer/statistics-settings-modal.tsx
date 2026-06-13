"use client";

import { useState } from "react";
import { Activity, BarChart2, ChevronDown, Hash, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { DatabaseStatBlockDto } from "@fixspace/domain";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { VisibleSections } from "../_types";

interface StatisticsSettingsModalProps {
  blocks: DatabaseStatBlockDto[];
  hiddenDbs: Set<string>;
  hiddenProps: Record<string, Set<string>>;
  sections: VisibleSections;
  onToggleDb: (databaseId: string) => void;
  onToggleProp: (databaseId: string, propertyName: string) => void;
  onToggleSection: (key: keyof VisibleSections) => void;
  onClose: () => void;
}

interface SectionConfig {
  key: keyof VisibleSections;
  icon: ReactNode;
  labelKey: string;
  descKey: string;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "activity",
    icon: <Activity size={14} />,
    labelKey: "settings.sectionActivity",
    descKey: "settings.sectionActivityDesc",
  },
  {
    key: "breakdowns",
    icon: <BarChart2 size={14} />,
    labelKey: "settings.sectionBreakdowns",
    descKey: "settings.sectionBreakdownsDesc",
  },
  {
    key: "ratings",
    icon: <Star size={14} />,
    labelKey: "settings.sectionRatings",
    descKey: "settings.sectionRatingsDesc",
  },
  {
    key: "numbers",
    icon: <Hash size={14} />,
    labelKey: "settings.sectionNumbers",
    descKey: "settings.sectionNumbersDesc",
  },
];

interface PropRow {
  name: string;
  typeLabel: string;
}

function getBlockProps(block: DatabaseStatBlockDto): PropRow[] {
  const rows: PropRow[] = [];
  for (const ratingAverage of block.ratingAverages) rows.push({ name: ratingAverage.propertyName, typeLabel: "rating" });
  for (const numberSummary of block.numberSummaries) rows.push({ name: numberSummary.propertyName, typeLabel: "number" });
  for (const breakdown of block.breakdowns) rows.push({ name: breakdown.propertyName, typeLabel: "select" });
  return rows;
}

export function StatisticsSettingsModal({
  blocks,
  hiddenDbs,
  hiddenProps,
  sections,
  onToggleDb,
  onToggleProp,
  onToggleSection,
  onClose,
}: StatisticsSettingsModalProps) {
  const t = useTranslations("Statistics");
  const [expandedDb, setExpandedDb] = useState<string | null>(null);

  return (
    <ModalShell isOpen onClose={onClose} title={t("settings.title")} size="sm">
      <div className="flex flex-col gap-6">
        {blocks.length > 0 && (
          <div>
            <p className="type-form-label text-ink-secondary mb-3">{t("settings.databases")}</p>
            <div className="flex flex-col gap-0.5">
              {blocks.map((block) => {
                const isVisible = !hiddenDbs.has(block.databaseId);
                const isExpanded = expandedDb === block.databaseId;
                const displayTitle = block.title || (t.raw(`keyDatabaseTypes.${block.type}`) as string) || block.type;
                const props = getBlockProps(block);
                const hiddenSet = hiddenProps[block.databaseId] ?? new Set<string>();

                return (
                  <div key={block.databaseId}>
                    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-elevated transition-colors duration-150">
                      <div className="shrink-0">
                        {block.icon ? <IconDisplay value={block.icon} size={14} /> : <span className="text-sm">📊</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink truncate">{displayTitle}</p>
                        <p className="type-hint text-ink-muted">
                          {block.recordCount} {t("records")}
                        </p>
                      </div>
                      {props.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedDb(isExpanded ? null : block.databaseId)}
                          className="text-ink-muted hover:text-ink transition-colors duration-150 p-0.5"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          <ChevronDown size={14} className={`transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                      <Toggle value={isVisible} onChange={() => onToggleDb(block.databaseId)} />
                    </div>

                    {isExpanded && props.length > 0 && (
                      <div className="ml-6 mb-1 flex flex-col gap-0.5">
                        {props.map((prop) => (
                          <div
                            key={prop.name}
                            className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-elevated transition-colors duration-150"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-ink-secondary truncate">{prop.name}</span>
                            </div>
                            <span className="text-xs text-ink-muted shrink-0">{t(`settings.propType.${prop.typeLabel}`)}</span>
                            <Toggle value={!hiddenSet.has(prop.name)} onChange={() => onToggleProp(block.databaseId, prop.name)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="type-form-label text-ink-secondary mb-3">{t("settings.sections")}</p>
          <div className="flex flex-col gap-0.5">
            {SECTION_CONFIGS.map(({ key, icon, labelKey, descKey }) => (
              <div key={key} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-elevated transition-colors duration-150">
                <div className="shrink-0 text-ink-muted">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{t(labelKey)}</p>
                  <p className="type-hint text-ink-muted">{t(descKey)}</p>
                </div>
                <Toggle value={sections[key]} onChange={() => onToggleSection(key)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
