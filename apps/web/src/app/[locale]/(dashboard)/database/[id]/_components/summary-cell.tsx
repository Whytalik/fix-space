"use client";

import { useDatabaseContext } from "@/context/database-context";
import { PropertyType, SummaryMetric } from "@fixspace/domain/enums";
import { calculateSummary, getAvailableMetrics } from "@/utils/record/summary-calculations";
import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/ui/cn";
import { Check, ChevronDown } from "lucide-react";
import { useDateFormat } from "@/hooks/format/use-date-format";

interface SummaryCellProps {
  propertyId: string;
  type: PropertyType;
  isPrimary?: boolean;
  className?: string;
}

export function SummaryCell({ propertyId, type, isPrimary = false, className }: SummaryCellProps) {
  const t = useTranslations("SummaryMetrics");
  const { allFilteredRecords, columnSummaries, setColumnSummary, isViewLocked } = useDatabaseContext();
  const { formatDate } = useDateFormat();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedMetric = columnSummaries[propertyId] || null;
  const availableMetrics = useMemo(() => getAvailableMetrics(type), [type]);

  const value = useMemo(() => {
    if (!selectedMetric) return null;
    return calculateSummary(allFilteredRecords, propertyId, type, selectedMetric, isPrimary);
  }, [allFilteredRecords, propertyId, type, selectedMetric, isPrimary]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedValue = useMemo(() => {
    if (value === null || value === undefined) return null;

    if (type === PropertyType.DATE && (selectedMetric === SummaryMetric.EARLIEST || selectedMetric === SummaryMetric.LATEST)) {
      return formatDate(value as string);
    }

    if (typeof value === "number") {
      if (selectedMetric === SummaryMetric.PERCENT_CHECKED) return value;
      return Number.isInteger(value) ? value : value.toFixed(2);
    }

    return String(value);
  }, [value, type, selectedMetric, formatDate]);

  return (
    <div className={cn("relative group", className)}>
      <button
        onClick={() => !isViewLocked && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-end w-full h-8 px-2 text-xs transition-colors duration-150 rounded hover:bg-black/5",
          !selectedMetric && "text-ink-muted italic opacity-0 group-hover:opacity-100",
          selectedMetric && "text-ink-secondary font-medium",
          isViewLocked && "cursor-default hover:bg-transparent",
        )}
      >
        <span className="truncate">
          {selectedMetric ? (
            <>
              <span className="mr-1 opacity-60 uppercase text-xs">{t(`metrics.${selectedMetric}`)}:</span>
              {formattedValue}
            </>
          ) : (
            t("calculate")
          )}
        </span>
        {!isViewLocked && (
          <ChevronDown size={12} className="ml-1 opacity-0 group-hover:opacity-60 transition-opacity duration-150 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-full right-0 mb-1 w-48 bg-canvas border border-stroke rounded-lg shadow-elevated z-50 py-1 max-h-64 overflow-y-auto scrollbar"
        >
          <button
            onClick={() => {
              setColumnSummary(propertyId, null);
              setIsOpen(false);
            }}
            className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-ink hover:bg-canvas-subtle transition-colors duration-150"
          >
            <span className="italic">{t("none")}</span>
            {!selectedMetric && <Check size={12} className="text-accent" />}
          </button>
          <div className="h-px bg-stroke my-1" />
          {availableMetrics.map((metric) => (
            <button
              key={metric}
              onClick={() => {
                setColumnSummary(propertyId, metric);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-ink hover:bg-canvas-subtle transition-colors duration-150"
            >
              <span>{t(`metrics.${metric}`)}</span>
              {selectedMetric === metric && <Check size={12} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
