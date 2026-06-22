"use client";

import { useDatabaseContext } from "@/context/database-context";
import { PropertyType, SummaryMetric } from "@fixspace/domain";
import type { RecordResponseDto } from "@fixspace/domain";
import { calculateSummary, getAvailableMetrics } from "@/utils/record/summary-calculations";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/ui/cn";
import { Check, ChevronDown } from "lucide-react";
import { useDateFormat } from "@/hooks/format/use-date-format";

interface SummaryCellProps {
  propertyId: string;
  type: PropertyType;
  isPrimary?: boolean;
  className?: string;
  records?: RecordResponseDto[];
}

export function SummaryCell({ propertyId, type, isPrimary = false, className, records: recordsProp }: SummaryCellProps) {
  const t = useTranslations("SummaryMetrics");
  const { allFilteredRecords, columnSummaries, setColumnSummary, isViewLocked } = useDatabaseContext();
  const { formatDate } = useDateFormat();
  const sourceRecords = recordsProp ?? allFilteredRecords;

  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedMetric = columnSummaries[propertyId] || null;
  const availableMetrics = useMemo(() => getAvailableMetrics(type), [type]);

  const value = useMemo(() => {
    if (!selectedMetric) return null;
    return calculateSummary(sourceRecords, propertyId, type, selectedMetric, isPrimary);
  }, [sourceRecords, propertyId, type, selectedMetric, isPrimary]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleToggle() {
    if (isViewLocked) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 4,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  }

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
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-end w-full h-8 px-2 text-xs transition-colors duration-150 rounded hover:bg-hover",
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

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="w-48 bg-canvas border border-stroke rounded-lg shadow-elevated py-1 max-h-64 overflow-y-auto no-scrollbar"
          >
            <button
              onClick={() => {
                setColumnSummary(propertyId, null);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-ink hover:bg-hover transition-colors duration-150"
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
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-ink hover:bg-hover transition-colors duration-150"
              >
                <span>{t(`metrics.${metric}`)}</span>
                {selectedMetric === metric && <Check size={12} className="text-accent" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
