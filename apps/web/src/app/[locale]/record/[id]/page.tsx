"use client";

import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { createPropertyValue, updatePropertyValue } from "@/lib/api/property-value";
import { deleteRecord, updateRecord } from "@/lib/api/record";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecordHeader } from "./_components/record-header";
import { RecordPropertiesSection } from "./_components/record-properties";
import { useTranslations } from "next-intl";

type FormValues = Record<string, unknown>;

function initValues(properties: PropertyResponseDto[], record: RecordResponseDto): FormValues {
  const vals: FormValues = {};
  for (const prop of properties) {
    const pv = record.values?.find((v) => v.propertyId === prop.id);
    vals[prop.id] = pv !== undefined ? pv.value : prop.type === PropertyType.CHECKBOX ? false : "";
  }
  return vals;
}

export default function RecordPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const t = useTranslations("RecordPage");
  const tc = useTranslations("RecordPageComp");

  const { records, properties, relatedRecordsMap, isLoading, database, refresh, invalidateRecords } =
    useDatabaseContext();
  const { showError } = useUIContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const record = useMemo(() => records.find((r) => r.id === id), [records, id]);
  const sorted = useMemo(
    () => [...properties].filter((p) => p.position !== 0).sort((a, b) => a.position - b.position),
    [properties],
  );

  const { groupOrder, grouped } = useMemo(() => {
    const order: string[] = [];
    const map: Record<string, PropertyResponseDto[]> = {};
    for (const prop of sorted) {
      const g = prop.group ?? "";
      if (!map[g]) {
        map[g] = [];
        order.push(g);
      }
      map[g].push(prop);
    }
    return { groupOrder: order, grouped: map };
  }, [sorted]);

  const [propsOpen, setPropsOpen] = useState(true);
  const [isEditMode, setEditMode] = useState(() => searchParams.get("edit") === "true");
  const [formValues, setFormValues] = useState<FormValues>({});
  const [nameValue, setNameValue] = useState("");
  const [iconValue, setIconValue] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      router.replace(`/record/${id}`);
    }
  }, [id, router, searchParams]);

  useEffect(() => {
    if (record) {
      setFormValues(initValues(properties, record));
      const primaryProp = properties.find((p) => p.position === 0);
      const primaryPv = primaryProp ? record.values?.find((v) => v.propertyId === primaryProp.id) : undefined;
      setNameValue(primaryPv?.value != null && primaryPv.value !== "" ? String(primaryPv.value) : (record.name ?? ""));
      setIconValue(record.icon ?? "");
    }
  }, [record, properties]);

  const getOriginalName = useCallback((): string => {
    if (!record) return "";
    const primaryProp = properties.find((p) => p.position === 0);
    const primaryPv = primaryProp ? record.values?.find((v) => v.propertyId === primaryProp.id) : undefined;
    return primaryPv?.value != null && primaryPv.value !== "" ? String(primaryPv.value) : (record.name ?? "");
  }, [record, properties]);

  const hasChanges = useCallback(
    (current: FormValues): boolean => {
      if (!record) return false;
      const original = initValues(properties, record);
      if (JSON.stringify(current) !== JSON.stringify(original)) return true;
      if (nameValue !== getOriginalName()) return true;
      if (iconValue !== (record.icon ?? "")) return true;
      return false;
    },
    [record, properties, nameValue, getOriginalName, iconValue],
  );

  const handleToggleMode = useCallback(async () => {
    if (!isEditMode) {
      setEditMode(true);
      return;
    }

    if (!record || !hasChanges(formValues)) {
      setEditMode(false);
      return;
    }

    try {
      setIsSaving(true);

      const nameChanged = nameValue !== getOriginalName();
      const iconChanged = iconValue !== (record.icon ?? "");
      if (nameChanged || iconChanged) {
        await updateRecord(record.id, {
          ...(nameChanged ? { name: nameValue } : {}),
          ...(iconChanged ? { icon: iconValue } : {}),
        });
      }

      const primaryProp = properties.find((p) => p.position === 0);
      await Promise.all([
        ...sorted.map(async (prop) => {
          const val = formValues[prop.id];
          if (val === "" || val === null || val === undefined) return;
          const existing = record.values?.find((v) => v.propertyId === prop.id);
          if (existing) {
            await updatePropertyValue(record.id, existing.id, { value: val });
          } else {
            await createPropertyValue(record.id, { propertyId: prop.id, value: val });
          }
        }),
        (async () => {
          if (!primaryProp || !nameValue) return;
          const existing = record.values?.find((v) => v.propertyId === primaryProp.id);
          if (existing) {
            await updatePropertyValue(record.id, existing.id, { value: nameValue });
          } else {
            await createPropertyValue(record.id, { propertyId: primaryProp.id, value: nameValue });
          }
        })(),
      ]);

      invalidateRecords();
      await refresh();
      setEditMode(false);
    } catch (err) {
      showError(err);
    } finally {
      setIsSaving(false);
    }
  }, [
    isEditMode,
    record,
    hasChanges,
    formValues,
    nameValue,
    iconValue,
    sorted,
    refresh,
    showError,
    getOriginalName,
    invalidateRecords,
    properties,
  ]);

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await deleteRecord(id);
      invalidateRecords();
      router.push(database?.id ? `/database/${database.id}` : "/");
    } catch (err) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-secondary text-sm">{tc("recordNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="px-8 pt-10 pb-20">
        <RecordHeader
          isEditMode={isEditMode}
          isSaving={isSaving}
          nameValue={nameValue}
          iconValue={iconValue}
          showIconPicker={showIconPicker}
          iconButtonRef={iconButtonRef}
          onToggleMode={handleToggleMode}
          onOpenDelete={() => setIsDeleteDialogOpen(true)}
          onNameChange={setNameValue}
          onIconChange={setIconValue}
          onIconPickerToggle={() => setShowIconPicker((v) => !v)}
          onIconPickerClose={() => setShowIconPicker(false)}
          record={record}
          propsOpen={propsOpen}
          onPropsToggle={() => setPropsOpen((v) => !v)}
        />

        <div className="h-px mb-8 bg-stroke" />

        {sorted.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("noProperties")}</p>
        ) : (
          <RecordPropertiesSection
            isEditMode={isEditMode}
            propsOpen={propsOpen}
            groupOrder={groupOrder}
            grouped={grouped}
            formValues={formValues}
            record={record}
            relatedRecordsMap={relatedRecordsMap}
            onValueChange={(propId, val) => setFormValues((prev) => ({ ...prev, [propId]: val }))}
          />
        )}
      </div>

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title={tc("deleteRecord")}
          description={tc("deleteRecordDesc")}
          confirmLabel={isDeleting ? tc("deleting") : tc("delete")}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
