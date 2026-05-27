"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CellValue } from "./cell-value";
import { PropertyHint } from "@/components/property/property-hint";
import { PropertyIcon } from "@/components/property/property-icon";
import { Button } from "@/components/ui/primitives/button";
import { ExternalLink } from "lucide-react";
import { useDatabaseContext } from "@/context/database-context";

interface DatabaseTableProps {
  databaseId: string;
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
  onRefresh: () => void;
}

export function DatabaseTable({ properties, records }: DatabaseTableProps) {
  const { relatedRecordsMap } = useDatabaseContext();
  const router = useRouter();

  const sorted = useMemo(() => [...properties].sort((a, b) => a.position - b.position), [properties]);

  function handleOpen(e: React.MouseEvent, recordId: string) {
    e.stopPropagation();
    router.push(`/record/${recordId}`);
  }

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-ink-secondary text-sm">
        No properties defined for this database.
      </div>
    );
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
                <th className="sticky right-0 bg-surface w-0 p-0 border-l-0" />
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={sorted.length + 1} className="px-3 py-8 text-center text-ink-secondary">
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
                      const pv = record.values?.find((v) => v.propertyId === prop.id);
                      const relatedDbId =
                        prop.type === PropertyType.RELATION
                          ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId
                          : undefined;
                      return (
                        <td key={prop.id} className="px-3 py-2.5 border-r border-stroke last:border-r-0 align-middle">
                          <CellValue
                            value={pv?.value}
                            type={prop.type}
                            relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                          />
                        </td>
                      );
                    })}
                    <td className="sticky right-0 w-0 p-0 align-middle">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2">
                        <div className="w-8 h-8 bg-gradient-to-l from-hover to-transparent -ml-8 pointer-events-none" />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleOpen(e, record.id)}
                          className="flex items-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink size={13} />
                          Open
                        </Button>
                      </div>
                    </td>
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
