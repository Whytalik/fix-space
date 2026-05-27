"use client";

import { PropertyIcon } from "@/components/property/property-icon";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/button";
import { Combobox } from "@/components/ui/primitives/combobox";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { createProperty, updateProperty } from "@/lib/api/property";
import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { Toggle } from "@/components/ui/primitives/toggle";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PropertyTypeConfig } from "./property-type-config";
import { getDefaultConfig, TYPE_META, TYPE_ORDER } from "./property-type-meta";

type PropertyFormModalProps = {
  mode: "create" | "edit" | "view";
  databaseId: string;
  property?: PropertyResponseDto;
  existingGroups: string[];
  databases: DatabaseResponseDto[];
  onClose: () => void;
  onSaved: (property: PropertyResponseDto) => void;
  onSwitchToEdit?: () => void;
};

export function PropertyFormModal({
  mode,
  databaseId,
  property,
  existingGroups,
  databases,
  onClose,
  onSaved,
  onSwitchToEdit,
}: PropertyFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(mode === "create" ? 1 : 2);
  const [selectedType, setSelectedType] = useState<PropertyType>(property?.type ?? PropertyType.TEXT);
  const [name, setName] = useState(property?.name ?? "");
  const [hint, setHint] = useState(property?.hint ?? "");
  const [group, setGroup] = useState(property?.group ?? "");
  const [icon, setIcon] = useState(property?.icon ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [isRequired, setIsRequired] = useState(property?.isRequired ?? false);
  const [config, setConfig] = useState<Record<string, unknown>>(
    (property?.config as unknown as Record<string, unknown>) ?? getDefaultConfig(property?.type ?? PropertyType.TEXT),
  );

  const savedRef = useRef<PropertyResponseDto | null>(null);
  const isViewMode = mode === "view";

  useEffect(() => setMounted(true), []);

  useEscape(() => {
    if (step === 2 && mode === "create") setStep(1);
    else onClose();
  });

  function patchConfig(patch: Record<string, unknown>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  function handleSelectType(type: PropertyType) {
    setSelectedType(type);
    setConfig(getDefaultConfig(type));
    setStep(2);
  }

  const {
    mutate: save,
    isLoading: isSaving,
    error,
  } = useMutation(async () => {
    const payload = {
      name: name.trim(),
      hint: hint.trim() || undefined,
      group: group.trim() || undefined,
      icon: icon || undefined,
      isRequired,
      config,
    };
    if (mode === "create") {
      savedRef.current = await createProperty(databaseId, {
        ...payload,
        type: selectedType,
        position: 9999,
      });
    } else if (mode === "edit") {
      savedRef.current = await updateProperty(property!.id, { ...payload, type: selectedType });
    }
  });

  async function handleSubmit() {
    if (!name.trim()) return;
    const ok = await save();
    if (!ok) return;
    onSaved(savedRef.current!);
    onClose();
  }

  if (!mounted) return null;

  const backdropClass = "fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-[3px] bg-canvas/50";

  if (step === 1) {
    return createPortal(
      <div className={backdropClass} onClick={onClose}>
        <div
          className="w-130 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
            <h2 className="type-modal-title">Add property — choose type</h2>
            <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2">
            {TYPE_ORDER.map((type) => {
              const meta = TYPE_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-stroke hover:border-accent hover:bg-surface text-left transition-colors group"
                >
                  <PropertyIcon
                    type={type}
                    size={15}
                    className="text-ink-muted group-hover:text-accent shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{meta.label}</p>
                    <p className="text-xs text-ink-muted mt-0.5 leading-snug">{meta.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className={backdropClass} onClick={onClose}>
      <div
        className="w-130 max-h-[85vh] bg-elevated border border-stroke rounded-xl shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stroke shrink-0">
          {mode === "create" && (
            <button type="button" onClick={() => setStep(1)} className="text-ink-muted hover:text-ink shrink-0">
              <ArrowLeft size={16} />
            </button>
          )}
          <PropertyIcon type={selectedType} size={15} className="text-ink-muted shrink-0" />
          <h2 className="type-modal-title flex-1">
            {mode === "create"
              ? `Add ${TYPE_META[selectedType].label} property`
              : mode === "view"
                ? "View property"
                : "Edit property"}
          </h2>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink shrink-0">
            <X size={16} />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto scrollbar px-5 py-5 flex flex-col gap-6${isViewMode ? " pointer-events-none opacity-70" : ""}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink border-b border-stroke pb-2 text-center">General</p>

            {mode === "edit" && (
              <div>
                <label className="type-field-label">Type</label>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-sm text-ink">
                    <PropertyIcon type={selectedType} size={14} className="text-ink-muted shrink-0" />
                    <span>{TYPE_META[selectedType].label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-accent hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="type-field-label">Icon (optional)</label>
              <div className="relative mt-1">
                <button
                  ref={iconButtonRef}
                  type="button"
                  onClick={() => setShowIconPicker((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors"
                >
                  {icon ? (
                    <>
                      <IconDisplay value={icon} size={16} />
                      <span className="text-ink-secondary text-xs">
                        {icon.startsWith("icon:") ? icon.slice(5) : icon}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-muted text-xs">Choose an icon…</span>
                  )}
                </button>
                {showIconPicker && (
                  <IconPicker
                    value={icon}
                    onChange={(v) => {
                      setIcon(v);
                      setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                    anchorEl={iconButtonRef.current}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="type-field-label">
                Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Property name…"
                className="field-input w-full mt-1"
                autoFocus={!isViewMode}
              />
            </div>

            <div>
              <label className="type-field-label">Group (optional)</label>
              <div className="mt-1">
                <Combobox
                  options={existingGroups.map((g) => ({ value: g, label: g }))}
                  value={group}
                  onChange={setGroup}
                  placeholder="Assign to a group…"
                  freeText
                  nullable
                />
              </div>
            </div>

            <div>
              <label className="type-field-label">Hint (optional)</label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Shown below the field label…"
                className="field-input w-full mt-1"
              />
            </div>

            <label className="flex items-center justify-between gap-4">
              <p className="text-sm text-ink">Required field</p>
              <Toggle value={isRequired} onChange={setIsRequired} />
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink border-b border-stroke pb-2 text-center">
              {TYPE_META[selectedType].label} settings
            </p>
            <PropertyTypeConfig
              type={selectedType}
              config={config}
              databases={databases}
              isViewMode={isViewMode}
              onPatch={patchConfig}
            />
          </div>
        </div>

        {error && <p className="px-5 pb-2 text-xs text-error shrink-0">{error}</p>}

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-stroke shrink-0">
          {isViewMode ? (
            <Button size="sm" onClick={() => onSwitchToEdit?.()}>
              Edit
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isSaving} loading={isSaving}>
                {mode === "create" ? "Add property" : "Save changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
