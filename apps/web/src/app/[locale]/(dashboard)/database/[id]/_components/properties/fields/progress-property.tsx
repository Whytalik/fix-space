"use client";

import { useEscape } from "@/hooks/ui/use-escape";
import { getPopoverStyle } from "@/utils/ui/popover";
import type { ProgressPropertyConfig } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ProgressPropertyProps = {
  value: number | null;
  readOnly?: boolean;
  config?: ProgressPropertyConfig | null;
  onChange?: (value: number | null) => void;
  className?: string;
};

export function ProgressProperty({ value, readOnly, config, onChange, className = "" }: ProgressPropertyProps) {
  const t = useTranslations("PropertyMeta");
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const minValue = config?.minValue ?? 0;
  const maxValue = config?.maxValue ?? 100;
  const step = config?.step ?? 1;
  const showLabel = config?.showLabel ?? true;

  const numericValue = value ?? minValue;

  const percentage = useMemo(() => {
    if (value === null) return 0;
    const p = ((numericValue - minValue) / (maxValue - minValue)) * 100;
    return Math.min(100, Math.max(0, p));
  }, [numericValue, minValue, maxValue, value]);

  const barColor = useMemo(() => {
    const thresholds = config?.thresholds ?? [];
    if (thresholds.length === 0) return "var(--color-accent)";
    const match = thresholds.find((threshold) => numericValue <= threshold.upTo);
    if (match) return match.color;
    return thresholds[thresholds.length - 1]?.color ?? "var(--color-accent)";
  }, [config?.thresholds, numericValue]);

  useEscape(() => setIsEditing(false));

  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (editorRef.current?.contains(e.target as Node) || anchorEl?.contains(e.target as Node)) return;
      setIsEditing(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, anchorEl]);

  const handleValueChange = (newValue: number) => {
    const clamped = Math.min(maxValue, Math.max(minValue, newValue));
    const stepped = Math.round(clamped / step) * step;
    const fixed = parseFloat(stepped.toFixed(6));
    onChange?.(fixed);
  };

  const renderBar = (
    <div
      className={`flex items-center gap-2 min-w-32 group/progress ${!readOnly ? "cursor-pointer" : ""} ${className}`}
      onClick={(e) => {
        if (readOnly) return;
        setAnchorEl(e.currentTarget);
        setIsEditing(true);
      }}
    >
      <div className="flex-1 h-2 bg-stroke rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <span className="text-ink-muted text-xs tabular-nums w-10 text-right font-medium group-hover/progress:text-ink transition-colors duration-150">
          {value === null ? "0" : numericValue}
        </span>
      )}
    </div>
  );

  return (
    <>
      {renderBar}
      {isEditing &&
        anchorEl &&
        createPortal(
          <div
            ref={editorRef}
            style={getPopoverStyle(anchorEl)}
            className="w-64 bg-elevated border border-stroke rounded-2xl shadow-xl p-4 flex flex-col gap-4 animate-fade-up z-[9999]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{t("progress.label")}</span>
              <span className="text-sm font-mono text-accent">{numericValue}</span>
            </div>

            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={step}
              value={numericValue}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-stroke accent-accent"
            />

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minValue}
                max={maxValue}
                step={step}
                value={numericValue}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                className="field-input flex-1 !text-center font-mono"
              />
            </div>

            <div className="flex justify-between text-xs text-ink-muted font-mono px-0.5">
              <span>{minValue}</span>
              <span>{maxValue}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
