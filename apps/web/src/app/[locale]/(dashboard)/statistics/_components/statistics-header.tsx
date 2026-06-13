"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, GitCompare } from "lucide-react";
import dayjs from "dayjs";
import type { StatisticsQuery } from "@/lib/api/statistics";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";

interface StatisticsHeaderProps {
  query: StatisticsQuery;
  onChange: (query: StatisticsQuery) => void;
}

type Preset = "week" | "month" | "quarter" | "year" | "all";

const PRESETS: { key: Preset; labelKey: string }[] = [
  { key: "week", labelKey: "presets.week" },
  { key: "month", labelKey: "presets.month" },
  { key: "quarter", labelKey: "presets.quarter" },
  { key: "year", labelKey: "presets.year" },
  { key: "all", labelKey: "presets.all" },
];

function presetToRange(preset: Preset): { from?: string; to?: string } {
  const now = dayjs();
  if (preset === "all") return {};
  if (preset === "quarter") {
    const quarterStart = dayjs(now)
      .startOf("month")
      .subtract(now.month() % 3, "month");
    return { from: quarterStart.toISOString(), to: quarterStart.add(3, "month").subtract(1, "ms").toISOString() };
  }
  const map: Record<Exclude<Preset, "all" | "quarter">, { from: string; to: string }> = {
    week: { from: now.startOf("week").toISOString(), to: now.endOf("week").toISOString() },
    month: { from: now.startOf("month").toISOString(), to: now.endOf("month").toISOString() },
    year: { from: now.startOf("year").toISOString(), to: now.endOf("year").toISOString() },
  };
  return map[preset];
}

export function StatisticsHeader({ query, onChange }: StatisticsHeaderProps) {
  const t = useTranslations("Statistics");
  const [activePreset, setActivePreset] = useState<Preset | null>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showCmpFromPicker, setShowCmpFromPicker] = useState(false);
  const [showCmpToPicker, setShowCmpToPicker] = useState(false);
  const fromRef = useRef<HTMLButtonElement>(null);
  const toRef = useRef<HTMLButtonElement>(null);
  const cmpFromRef = useRef<HTMLButtonElement>(null);
  const cmpToRef = useRef<HTMLButtonElement>(null);

  function applyPreset(preset: Preset) {
    setActivePreset(preset);
    const range = presetToRange(preset);
    onChange({ ...query, from: undefined, to: undefined, ...range, compareFrom: undefined, compareTo: undefined });
  }

  function formatDate(isoDate?: string) {
    return isoDate ? dayjs(isoDate).format("MMM D, YYYY") : t("datePlaceholder");
  }

  function toggleCompare() {
    const next = !compareMode;
    setCompareMode(next);
    if (!next) {
      onChange({ ...query, compareFrom: undefined, compareTo: undefined });
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-surface border border-stroke rounded-lg p-1">
        {PRESETS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={`px-3 py-1 text-xs rounded-md transition-colors duration-150 ${
              activePreset === key ? "bg-elevated text-ink font-medium" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          ref={fromRef}
          type="button"
          onClick={() => {
            setActivePreset(null);
            setShowFromPicker(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-stroke rounded-lg text-ink-secondary hover:text-ink transition-colors duration-150"
        >
          <CalendarDays size={12} />
          {formatDate(query.from)}
        </button>
        <span className="text-ink-muted text-xs">—</span>
        <button
          ref={toRef}
          type="button"
          onClick={() => {
            setActivePreset(null);
            setShowToPicker(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-stroke rounded-lg text-ink-secondary hover:text-ink transition-colors duration-150"
        >
          <CalendarDays size={12} />
          {formatDate(query.to)}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleCompare}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors duration-150 ${
          compareMode ? "bg-accent-muted border-accent text-accent" : "bg-surface border-stroke text-ink-secondary hover:text-ink"
        }`}
      >
        <GitCompare size={12} />
        {t("compare")}
      </button>

      {compareMode && (
        <div className="flex items-center gap-1">
          <button
            ref={cmpFromRef}
            type="button"
            onClick={() => setShowCmpFromPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-muted border border-accent rounded-lg text-ink-secondary hover:text-ink transition-colors duration-150"
          >
            <CalendarDays size={12} />
            {formatDate(query.compareFrom)}
          </button>
          <span className="text-ink-muted text-xs">—</span>
          <button
            ref={cmpToRef}
            type="button"
            onClick={() => setShowCmpToPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-muted border border-accent rounded-lg text-ink-secondary hover:text-ink transition-colors duration-150"
          >
            <CalendarDays size={12} />
            {formatDate(query.compareTo)}
          </button>
        </div>
      )}

      {showFromPicker && (
        <DatePickerPopup
          value={query.from ?? null}
          onChange={(v) => onChange({ ...query, from: v ?? undefined })}
          onClose={() => setShowFromPicker(false)}
          anchorEl={fromRef.current}
        />
      )}
      {showToPicker && (
        <DatePickerPopup
          value={query.to ?? null}
          onChange={(v) => onChange({ ...query, to: v ?? undefined })}
          onClose={() => setShowToPicker(false)}
          anchorEl={toRef.current}
        />
      )}
      {showCmpFromPicker && (
        <DatePickerPopup
          value={query.compareFrom ?? null}
          onChange={(v) => onChange({ ...query, compareFrom: v ?? undefined })}
          onClose={() => setShowCmpFromPicker(false)}
          anchorEl={cmpFromRef.current}
        />
      )}
      {showCmpToPicker && (
        <DatePickerPopup
          value={query.compareTo ?? null}
          onChange={(v) => onChange({ ...query, compareTo: v ?? undefined })}
          onClose={() => setShowCmpToPicker(false)}
          anchorEl={cmpToRef.current}
        />
      )}
    </div>
  );
}
