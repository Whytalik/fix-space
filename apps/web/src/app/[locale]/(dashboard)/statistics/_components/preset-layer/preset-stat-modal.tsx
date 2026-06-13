"use client";

import { useTranslations } from "next-intl";
import type { DatabaseStatBlockDto } from "@fixspace/domain";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { VisibleSections } from "../_types";
import { MetricsGrid } from "../trading-layer/metrics-grid";
import { EquityChart } from "../trading-layer/equity-chart";
import { BreakdownSection } from "../trading-layer/breakdown-section";
import { ActivityChart } from "./activity-chart";

interface PresetStatModalProps {
  block: DatabaseStatBlockDto;
  sections: VisibleSections;
  hiddenProps?: Set<string>;
  onClose: () => void;
}

const RATING_COLORS = [
  "var(--color-chart-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-ink-secondary)",
];

function pctDelta(a: number, b: number): number | null {
  if (b === 0) return null;
  return ((a - b) / Math.abs(b)) * 100;
}

export function PresetStatModal({ block, sections, hiddenProps, onClose }: PresetStatModalProps) {
  const t = useTranslations("Statistics");
  const { tradingKpis, compareKpis, equityCurve, compareEquityCurve, activityCurve, compareActivityCurve } = block;

  const visible = (name: string) => !hiddenProps?.has(name);

  const ratingAverages = block.ratingAverages.filter((ratingAverage) => visible(ratingAverage.propertyName));
  const compareRatingAverages = block.compareRatingAverages?.filter((ratingAverage) => visible(ratingAverage.propertyName));
  const numberSummaries = block.numberSummaries.filter((numberSummary) => visible(numberSummary.propertyName));
  const compareNumberSummaries = block.compareNumberSummaries?.filter((numberSummary) => visible(numberSummary.propertyName));
  const breakdowns = block.breakdowns.filter((breakdown) => visible(breakdown.propertyName));
  const compareBreakdowns = block.compareBreakdowns?.filter((breakdown) => visible(breakdown.propertyName));

  const hasCompare = !!(compareKpis || compareActivityCurve || block.compareBreakdowns);
  const displayTitle = block.title || (t.raw(`keyDatabaseTypes.${block.type}`) as string) || block.type;

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      title={displayTitle}
      size="2xl"
      headerPrefix={block.icon ? <IconDisplay value={block.icon} size={18} /> : <span className="text-base">📊</span>}
      headerSuffix={
        <div className="flex items-center gap-3">
          <span className="type-hint text-ink-muted">
            {block.recordCount} {t("records")}
          </span>
          {hasCompare && block.compareRecordCount !== undefined && (
            <span className="type-hint text-ink-muted opacity-60">vs {block.compareRecordCount}</span>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        {sections.activity && tradingKpis && (
          <section>
            <MetricsGrid metrics={tradingKpis} compareMetrics={compareKpis} />
          </section>
        )}

        {sections.activity && equityCurve && equityCurve.length > 0 && (
          <section>
            <EquityChart data={equityCurve} compareData={compareEquityCurve} />
          </section>
        )}

        {sections.activity && !tradingKpis && (
          <section>
            <ActivityChart data={activityCurve} compareData={compareActivityCurve} />
          </section>
        )}

        {sections.ratings && ratingAverages.length > 0 && (
          <section>
            <p className="type-form-label text-ink-secondary mb-4">{t("breakdowns")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ratingAverages.map((ratingAverage, i) => {
                const compareItem = compareRatingAverages?.find((c) => c.propertyName === ratingAverage.propertyName);
                const delta = compareItem ? pctDelta(ratingAverage.average, compareItem.average) : null;
                return (
                  <div key={ratingAverage.propertyName} className="card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="type-form-label text-ink">{ratingAverage.propertyName}</p>
                      <div className="flex items-center gap-2">
                        {compareItem && <span className="text-xs text-ink-muted tabular-nums">{compareItem.average.toFixed(1)}</span>}
                        <span className="text-xl font-bold text-ink tabular-nums">{ratingAverage.average.toFixed(1)}</span>
                        {delta !== null && (
                          <span className={`text-xs font-medium ${delta > 0 ? "text-success" : "text-error"}`}>
                            {delta > 0 ? "+" : ""}
                            {delta.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-elevated overflow-hidden">
                      {compareItem && (
                        <div
                          className="absolute h-full rounded-full opacity-40"
                          style={{ width: `${(compareItem.average / 5) * 100}%`, backgroundColor: RATING_COLORS[i % RATING_COLORS.length] }}
                        />
                      )}
                      <div
                        className="absolute h-full rounded-full"
                        style={{ width: `${(ratingAverage.average / 5) * 100}%`, backgroundColor: RATING_COLORS[i % RATING_COLORS.length] }}
                      />
                    </div>
                    <p className="type-hint text-ink-muted mt-1.5">
                      {ratingAverage.count} {t("records")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sections.numbers && numberSummaries.length > 0 && (
          <section>
            <p className="type-form-label text-ink-secondary mb-4">{t("breakdowns")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {numberSummaries.map((numberSummary) => {
                const compareItem = compareNumberSummaries?.find((c) => c.propertyName === numberSummary.propertyName);
                const delta = compareItem ? pctDelta(numberSummary.sum, compareItem.sum) : null;
                return (
                  <div key={numberSummary.propertyName} className="card-elevated p-4">
                    <p className="type-hint text-ink-muted mb-1">{numberSummary.propertyName}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-ink tabular-nums">{numberSummary.sum.toFixed(2)}</p>
                      {delta !== null && (
                        <span className={`text-xs font-medium mb-1 ${delta > 0 ? "text-success" : "text-error"}`}>
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {compareItem && <p className="type-hint text-ink-muted">vs {compareItem.sum.toFixed(2)}</p>}
                    <p className="type-hint text-ink-muted mt-0.5">
                      avg {numberSummary.average.toFixed(2)} · {numberSummary.count} {t("records")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sections.breakdowns && breakdowns.length > 0 && (
          <section>
            <BreakdownSection breakdowns={breakdowns} compareBreakdowns={compareBreakdowns} />
          </section>
        )}
      </div>
    </ModalShell>
  );
}
