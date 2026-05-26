"use client";

import type { RecordResponseDto } from "@fixspace/domain";

interface RelationInputProps {
  records: RecordResponseDto[];
  multiple: boolean;
  value: unknown;
  onChange: (val: unknown) => void;
}

export function RelationInput({ records, multiple, value, onChange }: RelationInputProps) {
  if (multiple) {
    const selected = Array.isArray(value) ? (value as string[]) : [];

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
      const next = Array.from(e.target.selectedOptions).map((o) => o.value);
      onChange(next);
    }

    return (
      <select multiple className="field-input cursor-pointer min-h-24" value={selected} onChange={handleChange}>
        {records.map((rec) => (
          <option key={rec.id} value={rec.id}>
            {rec.name || rec.id}
          </option>
        ))}
      </select>
    );
  }

  return (
    <select
      className="field-input cursor-pointer"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">— None —</option>
      {records.map((rec) => (
        <option key={rec.id} value={rec.id}>
          {rec.name || rec.id}
        </option>
      ))}
    </select>
  );
}
