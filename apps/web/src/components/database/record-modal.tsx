"use client";

import { createPropertyValue, createRecord, updatePropertyValue } from "@/lib/api/database";
import type { PropertyResponseDto, RecordResponseDto } from "@nucleus/domain";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type FormValues = Record<string, unknown>;

function getInitialValues(properties: PropertyResponseDto[], record?: RecordResponseDto): FormValues {
  const vals: FormValues = {};
  for (const prop of properties) {
    if (prop.type === "FORMULA" || prop.type === "RELATION") continue;
    const pv = record?.values?.find((v) => v.propertyId === prop.id);
    if (pv !== undefined) {
      vals[prop.id] = pv.value;
    } else {
      vals[prop.id] = prop.type === "CHECKBOX" ? false : "";
    }
  }
  return vals;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors duration-150 placeholder:text-ink-muted";

function PropertyInput({
  property,
  value,
  onChange,
}: {
  property: PropertyResponseDto;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (property.type) {
    case "TEXT":
      return (
        <input
          type="text"
          className={INPUT_CLASS}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text…"
        />
      );

    case "NUMBER":
      return (
        <input
          type="number"
          className={INPUT_CLASS}
          value={value === "" || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="0"
        />
      );

    case "DATE":
      return (
        <input
          type="date"
          className={INPUT_CLASS}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "CHECKBOX":
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

    case "SELECT": {
      const config = property.config as { options?: string[] } | null;
      const options = config?.options ?? [];
      return (
        <select
          className={`${INPUT_CLASS} cursor-pointer`}
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

    case "STATUS": {
      const config = property.config as {
        categories?: Array<{ options: Array<{ name: string; color: string }> }>;
      } | null;
      const allOptions = config?.categories?.flatMap((c) => c.options) ?? [];
      const currentLabel =
        value && typeof value === "object"
          ? ((value as Record<string, unknown>).label as string)
          : String(value ?? "");
      return (
        <select
          className={`${INPUT_CLASS} cursor-pointer`}
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

    case "FORMULA":
    case "RELATION":
      return <span className="text-sm text-ink-muted italic">Read-only</span>;

    default:
      return (
        <input
          type="text"
          className={INPUT_CLASS}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

interface RecordModalProps {
  databaseId: string;
  properties: PropertyResponseDto[];
  record?: RecordResponseDto;
  onClose: () => void;
  onSaved: () => void;
}

export function RecordModal({ databaseId, properties, record, onClose, onSaved }: RecordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<FormValues>(() => getInitialValues(properties, record));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const editableProps = properties
    .filter((p) => p.type !== "FORMULA" && p.type !== "RELATION")
    .sort((a, b) => a.position - b.position);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      let recordId = record?.id;
      if (!recordId) {
        const created = await createRecord(databaseId, {});
        recordId = created.id;
      }

      await Promise.all(
        editableProps.map(async (prop) => {
          const val = values[prop.id];
          const isEmpty = val === "" || val === null || val === undefined;
          if (isEmpty) return;

          const existing = record?.values?.find((v) => v.propertyId === prop.id);
          if (existing) {
            await updatePropertyValue(recordId!, existing.id, { value: val });
          } else {
            await createPropertyValue(recordId!, { propertyId: prop.id, value: val });
          }
        }),
      );

      onSaved();
    } catch {
      setError("Failed to save record. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted) return null;

  const isEdit = Boolean(record);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-120 max-h-[80vh] overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <h2 className="text-base font-bold text-ink">{isEdit ? "Edit record" : "New record"}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {editableProps.map((prop) => (
            <div key={prop.id}>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                {prop.name}
                {prop.isRequired && <span className="ml-1 text-error">*</span>}
              </label>
              <PropertyInput
                property={prop}
                value={values[prop.id]}
                onChange={(val) => setValues((prev) => ({ ...prev, [prop.id]: val }))}
              />
            </div>
          ))}

          {editableProps.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-secondary">No editable properties.</p>
          )}

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stroke px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg font-medium text-ink-secondary bg-surface hover:bg-elevated hover:text-ink transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
