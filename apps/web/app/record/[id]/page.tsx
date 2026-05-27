"use client";

import { CellValue } from "@/components/database/cell-value";
import { PropertyHint } from "@/components/property/property-hint";
import { PropertyIcon } from "@/components/property/property-icon";
import { PropertyInput } from "@/components/property/property-input";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { Button } from "@/components/ui/primitives/button";
import { Card } from "@/components/ui/primitives/card";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { createPropertyValue, updatePropertyValue } from "@/lib/api/property-value";
import { deleteRecord, updateRecord } from "@/lib/api/record";
import { clearCached } from "@/lib/cache";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { ChevronDown, Eye, Notebook, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  const { records, properties, relatedRecordsMap, isLoading, database, refresh } = useDatabaseContext();
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
      setNameValue(record.name ?? "");
      setIconValue(record.icon ?? "");
    }
  }, [record, properties]);

  const handleToggleMode = useCallback(async () => {
    function hasChanges(current: FormValues): boolean {
      if (!record) return false;
      const original = initValues(properties, record);
      if (JSON.stringify(current) !== JSON.stringify(original)) return true;
      if (nameValue !== (record.name ?? "")) return true;
      if (iconValue !== (record.icon ?? "")) return true;
      return false;
    }

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

      const nameChanged = nameValue !== (record.name ?? "");
      const iconChanged = iconValue !== (record.icon ?? "");
      if (nameChanged || iconChanged) {
        await updateRecord(record.id, {
          ...(nameChanged ? { name: nameValue } : {}),
          ...(iconChanged ? { icon: iconValue } : {}),
        });
      }

      await Promise.all(
        sorted.map(async (prop) => {
          const val = formValues[prop.id];
          if (val === "" || val === null || val === undefined) return;
          const existing = record.values?.find((v) => v.propertyId === prop.id);
          if (existing) {
            await updatePropertyValue(record.id, existing.id, { value: val });
          } else {
            await createPropertyValue(record.id, { propertyId: prop.id, value: val });
          }
        }),
      );

      clearCached(`db-recs:${database?.id}`);
      await refresh();
      setEditMode(false);
    } catch (err) {
      showError(err);
    } finally {
      setIsSaving(false);
    }
  }, [isEditMode, record, formValues, nameValue, iconValue, sorted, database?.id, refresh, showError, properties]);

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await deleteRecord(id);
      if (database?.id) clearCached(`db-recs:${database.id}`);
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
        <p className="text-ink-secondary text-sm">Record not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas scrollbar">
      <div className="px-8 pt-10 pb-20">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isEditMode ? (
              <>
                <button
                  ref={iconButtonRef}
                  type="button"
                  onClick={() => setShowIconPicker((v) => !v)}
                  className="text-[2.25rem] leading-none shrink-0 hover:opacity-70 transition-opacity duration-150 cursor-pointer"
                  title="Change icon"
                >
                  {iconValue ? <IconDisplay value={iconValue} size={45} /> : <Notebook size={45} />}
                </button>
                {showIconPicker && (
                  <IconPicker
                    value={iconValue}
                    onChange={(val) => {
                      setIconValue(val);
                      setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                    anchorEl={iconButtonRef.current}
                  />
                )}
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-transparent text-[2.5rem] font-bold leading-[1.1] tracking-tight text-ink border-b border-stroke focus:border-accent outline-none transition-colors duration-150 pb-1"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Untitled"
                />
              </>
            ) : (
              <>
                <span className="text-[2.25rem] leading-none shrink-0 select-none">
                  {record.icon ? <IconDisplay value={record.icon} size={45} /> : <Notebook size={45} />}
                </span>
                s
                <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-ink wrap-break-word">
                  {record.name || "Untitled"}
                </h1>
              </>
            )}
          </div>

          <div className="flex gap-1.5 shrink-0">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleToggleMode}
              disabled={isSaving}
              title={isSaving ? "Saving…" : isEditMode ? "View mode" : "Edit mode"}
              className="p-2.5!"
            >
              {isSaving ? (
                <span className="w-4 h-4 rounded-full border-2 border-stroke border-t-accent animate-spin" />
              ) : isEditMode ? (
                <Eye size={16} />
              ) : (
                <Pencil size={16} />
              )}
            </Button>
            <Button
              size="icon"
              variant="danger"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Delete record"
              className="p-2.5!"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="h-px mb-8 bg-stroke" />

        {sorted.length === 0 ? (
          <p className="text-sm text-ink-muted">No properties defined for this database.</p>
        ) : (
          <div>
            <button
              onClick={() => setPropsOpen((v) => !v)}
              className="flex items-center gap-1.5 mb-3 text-xs text-ink-muted hover:text-ink-secondary transition-colors duration-150 select-none"
            >
              <ChevronDown
                size={13}
                className="transition-transform duration-200"
                style={{ transform: propsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
              {propsOpen ? "Hide properties" : "Show properties"}
            </button>

            {propsOpen && (
              <div className="flex flex-col gap-4">
                {groupOrder.map((groupName) => (
                  <div key={groupName} className="flex flex-col gap-3">
                    {groupName && (
                      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted select-none">
                        {groupName}
                      </h3>
                    )}
                    <div
                      className="grid gap-3"
                      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
                    >
                      {(grouped[groupName] ?? []).map((prop) => {
                        const pv = record.values?.find((v) => v.propertyId === prop.id);
                        const relatedDbId =
                          prop.type === PropertyType.RELATION
                            ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId
                            : undefined;
                        const statusColor =
                          prop.type === PropertyType.STATUS && typeof pv?.value === "object" && pv?.value !== null
                            ? ((pv.value as Record<string, unknown>).color as string | undefined)
                            : undefined;

                        return (
                          <Card
                            key={prop.id}
                            variant="convex"
                            className={`flex flex-col gap-2 p-3! transition-colors duration-150 ${isEditMode ? "" : "hover:bg-hover"}`}
                            style={statusColor ? { borderLeft: `2px solid ${statusColor}` } : undefined}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">
                              <PropertyIcon type={prop.type} size={10} />
                              <span className="truncate">{prop.name}</span>
                              {prop.position === 0 && <span className="ml-auto text-accent text-[8px]">●</span>}
                              {prop.hint && <PropertyHint hint={prop.hint} />}
                            </div>

                            {isEditMode ? (
                              <PropertyInput
                                property={prop}
                                value={formValues[prop.id]}
                                onChange={(val) => setFormValues((prev) => ({ ...prev, [prop.id]: val }))}
                                relationRecordsMap={relatedRecordsMap}
                              />
                            ) : (
                              <div
                                className={prop.position === 0 ? "text-xl font-semibold text-ink" : "text-sm text-ink"}
                              >
                                <CellValue
                                  value={pv?.value}
                                  type={prop.type}
                                  relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                                />
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mt-6 min-h-40">
          <p className="text-sm text-ink-muted">Content goes here…</p>
        </Card>
      </div>

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Delete record"
          description="This record will be permanently deleted."
          confirmLabel={isDeleting ? "Deleting…" : "Delete"}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
