"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { useMemo } from "react";
import { CellValue } from "@/features/database/cell-value";
import { PropertyHint } from "@/features/property/property-hint";
import { PropertyIcon } from "@/features/property/property-icon";
import { useDatabaseContext } from "@/context/database-context";

interface DatabaseTableProps {
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
}

export function DatabaseTable({ properties, records }: DatabaseTableProps) {
  const { relatedRecordsMap } = useDatabaseContext();

  const sorted = useMemo(() => [...properties].sort((a, b) => a.position - b.position), [properties]);

  if (sorted.length === 0) {
    return <div className="flex items-center justify-center h-40 text-ink-secondary text-sm">No properties defined for this database.</div>;
  }

  return (
    <>
      <div className="scrollbar rounded-lg border border-stroke overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface border-b border-stroke">
                {sorted.map((prop) => (
                  <th
                    key={prop.id}
                    className="px-3 py-2.5 text-left font-medium text-ink-secondary whitespace-nowrap border-r border-stroke last:border-r-0"
                    style={{ minWidth: "140px" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-ink-muted">
                        <PropertyIcon type={prop.type} />
                      </span>
                      {prop.name}
                      {prop.position === 0 && <span className="ml-1 text-xs text-accent">●</span>}
                      {prop.hint && <PropertyHint hint={prop.hint} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={sorted.length} className="px-3 py-8 text-center text-ink-secondary">
                    No records yet.
                  </td>
                </tr>
              ) : (
                records.map((record, rowIdx) => (
                  <tr
                    key={record.id}
                    className={`group relative border-b border-stroke last:border-b-0 transition-colors duration-100 hover:bg-hover ${
                      rowIdx % 2 === 1 ? "bg-surface/30" : ""
                    }`}
                  >
                    {sorted.map((prop) => {
                      const propertyValue = record.values?.find((v) => v.propertyId === prop.id);
                      const relatedDbId =
                        prop.type === PropertyType.RELATION
                          ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId
                          : undefined;
                      return (
                        <td key={prop.id} className="px-3 py-2.5 border-r border-stroke last:border-r-0 align-middle">
                          <CellValue
                            value={propertyValue?.value}
                            type={prop.type}
                            relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
