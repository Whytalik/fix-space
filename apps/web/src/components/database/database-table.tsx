"use client";

import type { PropertyResponseDto, RecordResponseDto } from "@nucleus/domain";
import { useState } from "react";
import { PropertyIcon } from "./property-icon";
import { RecordModal } from "./record-modal";

interface DatabaseTableProps {
  databaseId: string;
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
  onRefresh: () => void;
}

function CellValue({ value, type }: { value: unknown; type: string }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-ink-muted">—</span>;
  }

  switch (type) {
    case "CHECKBOX":
      return (
        <span
          className={`inline-block w-4 h-4 rounded border ${
            value ? "bg-accent border-accent" : "border-stroke"
          }`}
        />
      );

    case "DATE": {
      const date = new Date(value as string);
      if (isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
      return (
        <span className="text-ink-secondary text-sm">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      );
    }

    case "SELECT":
    case "STATUS": {
      const label =
        typeof value === "object" && value !== null
          ? ((value as Record<string, unknown>).label ?? String(value))
          : String(value);
      const color =
        typeof value === "object" && value !== null
          ? ((value as Record<string, unknown>).color as string | undefined)
          : undefined;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            color ? "" : "bg-elevated text-ink-secondary"
          }`}
          style={color ? { backgroundColor: `${color}20`, color } : undefined}
        >
          {String(label)}
        </span>
      );
    }

    case "NUMBER":
      return (
        <span className="text-ink tabular-nums text-sm">
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </span>
      );

    default:
      return <span className="text-ink text-sm truncate max-w-50">{String(value)}</span>;
  }
}

export function DatabaseTable({ databaseId, properties, records, onRefresh }: DatabaseTableProps) {
  const [modal, setModal] = useState<{ open: boolean; record?: RecordResponseDto }>({ open: false });

  const sorted = [...properties].sort((a, b) => a.position - b.position);

  function handleSaved() {
    setModal({ open: false });
    onRefresh();
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
      <div className="rounded-lg border border-stroke overflow-hidden">
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
                      {prop.isPrimary && <span className="ml-1 text-xs text-accent">●</span>}
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
                    onClick={() => setModal({ open: true, record })}
                    className={`cursor-pointer border-b border-stroke last:border-b-0 transition-colors duration-100 hover:bg-hover ${
                      rowIdx % 2 === 1 ? "bg-surface/30" : ""
                    }`}
                  >
                    {sorted.map((prop) => {
                      const pv = record.values?.find((v) => v.propertyId === prop.id);
                      return (
                        <td
                          key={prop.id}
                          className="px-3 py-2.5 border-r border-stroke last:border-r-0 align-middle"
                        >
                          <CellValue value={pv?.value} type={prop.type} />
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

      {modal.open && (
        <RecordModal
          databaseId={databaseId}
          properties={properties}
          record={modal.record}
          onClose={() => setModal({ open: false })}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
