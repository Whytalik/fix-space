"use client";

import { PropertyInput } from "@/components/property/property-input";
import { Button } from "@/components/ui/primitives/button";
import { useDatabaseContext } from "@/context/database-context";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { createPropertyValue, updatePropertyValue } from "@/lib/api/property-value";
import { createRecord, updateRecord } from "@/lib/api/record";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type FormValues = Record<string, unknown>;

function getInitialValues(properties: PropertyResponseDto[], record?: RecordResponseDto): FormValues {
  const vals: FormValues = {};
  for (const prop of properties) {
    const pv = record?.values?.find((v) => v.propertyId === prop.id);
    if (pv !== undefined) {
      vals[prop.id] = pv.value;
    } else {
      vals[prop.id] = prop.type === PropertyType.CHECKBOX ? false : "";
    }
  }
  return vals;
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
  const { relatedRecordsMap } = useDatabaseContext();

  useEffect(() => setMounted(true), []);
  useEscape(onClose);

  const editableProps = properties.sort((a, b) => a.position - b.position);

  const {
    mutate: save,
    isLoading: isSaving,
    error,
  } = useMutation(async () => {
    const primaryProp = editableProps.find((p) => p.position === 0);
    const primaryName = primaryProp && values[primaryProp.id] ? String(values[primaryProp.id]) : undefined;

    let recordId = record?.id;
    if (!recordId) {
      const created = await createRecord(databaseId, { name: primaryName });
      recordId = created.id;
    } else if (primaryName !== undefined) {
      await updateRecord(recordId, { name: primaryName });
    }
    await Promise.all(
      editableProps.map(async (prop) => {
        const val = values[prop.id];
        if (val === "" || val === null || val === undefined) return;
        const existing = record?.values?.find((v) => v.propertyId === prop.id);
        if (existing) {
          await updatePropertyValue(recordId!, existing.id, { value: val });
        } else {
          await createPropertyValue(recordId!, { propertyId: prop.id, value: val });
        }
      }),
    );
  });

  async function handleSave() {
    const ok = await save();
    if (ok) onSaved();
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
          <h2 className="type-modal-title">{isEdit ? "Edit record" : "New record"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="scrollbar flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {editableProps.map((prop) => (
            <div key={prop.id}>
              <label className="block mb-1.5 type-field-label">
                {prop.name}
                {prop.isRequired && <span className="ml-1 text-error">*</span>}
              </label>
              <PropertyInput
                property={prop}
                value={values[prop.id]}
                onChange={(val) => setValues((prev) => ({ ...prev, [prop.id]: val }))}
                relationRecordsMap={relatedRecordsMap}
              />
            </div>
          ))}

          {editableProps.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-secondary">No editable properties.</p>
          )}

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stroke px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving}>
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
