"use client";

import { PropertyType } from "@nucleus/domain";
import type { PropertyResponseDto, RecordResponseDto } from "@nucleus/domain";
import { RelationInput } from "./relation-input";

interface PropertyInputProps {
  property: PropertyResponseDto;
  value: unknown;
  onChange: (val: unknown) => void;
  relationRecordsMap?: Record<string, RecordResponseDto[]>;
}

export function PropertyInput({ property, value, onChange, relationRecordsMap }: PropertyInputProps) {
  switch (property.type) {
    case PropertyType.TEXT:
      return (
        <input
          type="text"
          className="field-input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text…"
        />
      );

    case PropertyType.NUMBER:
      return (
        <input
          type="number"
          className="field-input"
          value={value === "" || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="0"
        />
      );

    case PropertyType.DATE:
      return (
        <input
          type="date"
          className="field-input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case PropertyType.CHECKBOX:
      return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 accent-accent"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm text-ink-secondary">Checked</span>
        </label>
      );

    case PropertyType.SELECT: {
      const config = property.config as { categories?: Array<{ label: string; options: string[] }> } | null;
      const options = config?.categories?.flatMap((c) => c.options) ?? [];
      return (
        <select
          className="field-input cursor-pointer"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— None —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    case PropertyType.STATUS: {
      const config = property.config as {
        categories?: Array<{ options: Array<{ name: string; color: string }> }>;
      } | null;
      const allOptions = config?.categories?.flatMap((c) => c.options) ?? [];
      const currentLabel =
        value && typeof value === "object" ? ((value as Record<string, unknown>).label as string) : String(value ?? "");
      return (
        <select
          className="field-input cursor-pointer"
          value={currentLabel}
          onChange={(e) => {
            const opt = allOptions.find((o) => o.name === e.target.value);
            onChange(opt ? { label: opt.name, color: opt.color } : "");
          }}
        >
          <option value="">— None —</option>
          {allOptions.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      );
    }

    case PropertyType.RELATION: {
      const config = property.config as { relatedEntityId?: string; multiple?: boolean } | null;
      const records = config?.relatedEntityId ? (relationRecordsMap?.[config.relatedEntityId] ?? []) : [];
      return <RelationInput records={records} multiple={config?.multiple ?? false} value={value} onChange={onChange} />;
    }

    case PropertyType.FORMULA:
      return <input type="text" className="field-input" value="" disabled />;

    default:
      return (
        <input
          type="text"
          className="field-input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
