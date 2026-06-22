"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DatabaseStatBlockDto } from "@fixspace/domain";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { VisibleSections } from "../_types";
import { ActivitySparkline } from "./activity-sparkline";
import { PresetStatModal } from "./preset-stat-modal";

interface PresetStatCardProps {
  block: DatabaseStatBlockDto;
  sections: VisibleSections;
  hiddenProps?: Set<string>;
}

interface Highlight {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}

function getHighlights(block: DatabaseStatBlockDto): Highlight[] {
  const { type, tradingKpis, ratingAverages, numberSummaries, breakdowns } = block;

  if (type === "trading-journal" && tradingKpis) {
    return [
      { label: "Win Rate", value: `${(tradingKpis.winRate * 100).toFixed(1)}%`, positive: tradingKpis.winRate >= 0.5 },
      {
        label: "Total P&L",
        value: `${tradingKpis.totalPnl >= 0 ? "+" : ""}${tradingKpis.totalPnl.toFixed(2)}`,
        positive: tradingKpis.totalPnl > 0,
        negative: tradingKpis.totalPnl < 0,
      },
      { label: "Profit Factor", value: tradingKpis.profitFactor === 999 ? "∞" : tradingKpis.profitFactor.toFixed(2) },
    ];
  }

  const highlights: Highlight[] = [];

  for (const ratingAverage of ratingAverages.slice(0, 2)) {
    highlights.push({ label: ratingAverage.propertyName, value: `${ratingAverage.average.toFixed(1)} / 5` });
  }

  for (const numberSummary of numberSummaries) {
    if (highlights.length >= 2) break;
    highlights.push({ label: numberSummary.propertyName, value: numberSummary.sum.toFixed(2) });
  }

  const firstBreakdown = breakdowns[0];
  if (highlights.length < 2 && firstBreakdown) {
    const topItem = firstBreakdown.items[0];
    if (topItem) {
      highlights.push({ label: firstBreakdown.propertyName, value: topItem.label });
    }
  }

  return highlights.slice(0, 3);
}

export function PresetStatCard({ block, sections, hiddenProps }: PresetStatCardProps) {
  const t = useTranslations("Statistics");
  const [modalOpen, setModalOpen] = useState(false);
  const highlights = getHighlights(block);
  const displayTitle = block.name || (t.raw(`keyDatabaseTypes.${block.type}`) as string) || block.type;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="card flex flex-col gap-0 overflow-hidden text-left w-full hover:border-accent transition-colors duration-150 cursor-pointer"
      >
        <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
          {block.icon ? <IconDisplay value={block.icon} size={18} /> : <span className="text-base">📊</span>}
          <div className="min-w-0 flex-1">
            <p className="type-form-label text-ink truncate">{displayTitle}</p>
            <p className="type-hint text-ink-muted">
              {block.recordCount} {t("records")}
            </p>
          </div>
        </div>

        {highlights.length > 0 && (
          <div className="px-5 pb-3 flex flex-col gap-1.5">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-ink-muted truncate">{highlight.label}</span>
                <span
                  className={`text-xs font-medium tabular-nums ${highlight.positive ? "text-success" : highlight.negative ? "text-error" : "text-ink"}`}
                >
                  {highlight.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {block.activityCurve.length > 0 && (
          <div className="px-3 pb-3">
            <ActivitySparkline data={block.activityCurve} />
          </div>
        )}
      </button>

      {modalOpen && <PresetStatModal block={block} sections={sections} hiddenProps={hiddenProps} onClose={() => setModalOpen(false)} />}
    </>
  );
}
