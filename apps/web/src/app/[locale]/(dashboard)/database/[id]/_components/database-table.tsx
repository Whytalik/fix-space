"use client";

import { CellValue } from "@/components/database/cell-value";
import { PropertyHint } from "@/components/property/property-hint";
import { PropertyIcon } from "@/components/property/property-icon";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useDatabaseContext } from "@/context/database-context";
import { useColumnWidths } from "@/hooks/useColumnWidths";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { Notebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DatabasePagination } from "./database-pagination";
import { useTranslations } from "next-intl";

type DatabaseTableProps = {
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
};

export function DatabaseTable({ properties, records }: DatabaseTableProps) {
  const { relatedRecordsMap, database, wrapCells } = useDatabaseContext();
  const router = useRouter();
  const { getWidth, getHandleProps, initializeWidths } = useColumnWidths(database?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const t = useTranslations("DatabaseTable");

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => entry && setContainerWidth(entry.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const sorted = useMemo(
    () => [...properties].filter((p) => p.isVisible !== false).sort((a, b) => a.position - b.position),
    [properties],
  );

  const totalWidth = sorted.reduce((sum, prop) => sum + getWidth(prop.id), 0);
  const tableWidth = Math.max(totalWidth, containerWidth);

  useLayoutEffect(() => {
    if (!tableRef.current || sorted.length === 0) return;
    const ths = Array.from(tableRef.current.querySelectorAll("th"));
    const PADDING = 24;
    const measurements: Record<string, number> = {};
    sorted.slice(0, -1).forEach((prop, i) => {
      const contentSpan = ths[i]?.firstElementChild as HTMLElement | null;
      if (contentSpan) {
        const clone = contentSpan.cloneNode(true) as HTMLElement;
        clone.style.cssText = "position:absolute;visibility:hidden;width:auto;white-space:nowrap;";
        document.body.appendChild(clone);
        const naturalWidth = clone.scrollWidth;
        document.body.removeChild(clone);
        measurements[prop.id] = Math.max(80, naturalWidth + PADDING);
      }
    });
    initializeWidths(measurements);
  }, [sorted, initializeWidths]);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-ink-secondary text-sm">{t("noColumnsDefined")}</div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="rounded-lg border border-stroke overflow-x-auto overflow-y-hidden scrollbar">
        <table ref={tableRef} className="text-sm border-collapse" style={{ tableLayout: "fixed", width: tableWidth }}>
          <thead>
            <tr className="bg-surface border-b border-stroke">
              {sorted.map((prop, idx) => (
                <th
                  key={prop.id}
                  className={`relative px-3 py-2.5 text-left font-medium text-ink-secondary whitespace-nowrap border-r border-stroke ${idx === sorted.length - 1 ? "border-r-0" : ""}`}
                  style={idx < sorted.length - 1 ? { width: getWidth(prop.id), minWidth: 80 } : { minWidth: 80 }}
                >
                  <span className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-ink-muted leading-none shrink-0 flex items-center">
                      {prop.icon ? <IconDisplay value={prop.icon} size={13} /> : <PropertyIcon type={prop.type} />}
                    </span>
                    <span className="truncate">{prop.name}</span>
                    {prop.hint && <PropertyHint hint={prop.hint} />}
                  </span>
                  <div
                    {...getHandleProps(prop.id)}
                    className="absolute right-0 top-0 h-full w-2 z-10 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 select-none touch-none"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={sorted.length} className="px-3 py-8 text-center text-ink-secondary">
                  {t("noRecords")}
                </td>
              </tr>
            ) : (
              records.map((record, rowIdx) => (
                <tr
                  key={record.id}
                  onClick={() => router.push(`/record/${record.id}`)}
                  className={`cursor-pointer border-b border-stroke last:border-b-0 transition-colors duration-100 hover:bg-hover ${
                    rowIdx % 2 === 1 ? "bg-surface/30" : ""
                  }`}
                >
                  {sorted.map((prop) => {
                    const pv = record.values?.find((v) => v.propertyId === prop.id);
                    const relatedDbId =
                      prop.type === PropertyType.RELATION
                        ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId
                        : undefined;
                    return (
                      <td
                        key={prop.id}
                        className={`px-3 py-2.5 border-r border-stroke last:border-r-0 align-middle${wrapCells ? "" : " whitespace-nowrap overflow-hidden"}`}
                      >
                        {prop.position === 0 ? (
                          <span className="flex items-start gap-1.5">
                            <span className="leading-none shrink-0 flex items-center text-ink-muted mt-[3px]">
                              {record.icon ? <IconDisplay value={record.icon} size={14} /> : <Notebook size={14} />}
                            </span>
                            {pv?.value != null && pv.value !== "" ? (
                              <CellValue
                                value={pv.value}
                                type={prop.type}
                                relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                              />
                            ) : record.name ? (
                              <span className="text-ink text-sm">{record.name}</span>
                            ) : (
                              <span className="text-ink-muted text-sm">{t("untitled")}</span>
                            )}
                          </span>
                        ) : (
                          <CellValue
                            value={pv?.value}
                            type={prop.type}
                            relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DatabasePagination />
    </>
  );
}
