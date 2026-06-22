"use client";

import { PropertyIcon } from "../../_components/properties/ui/property-icon";
import { Button } from "@/components/ui/primitives/actions/button";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { FormField } from "@/components/ui/form/form-field";
import { IconPickerField } from "@/components/ui/form/icon-picker-field";
import { useEscape } from "@/hooks/ui/use-escape";
import { useMutation } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api/client";
import { createProperty, updateProperty } from "@/lib/api/property";
import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PropertyTypeConfig } from "./property-type-config";
import { VisibilityConditionEditor } from "./visibility-condition-editor";
import { getDefaultConfig, getTypeMeta, TYPE_ORDER } from "@/utils/property/property-type-meta";
import { useTranslations } from "next-intl";
import type { VisibilityConditionDto } from "@fixspace/domain";

const TYPES_WITHOUT_CONFIG: PropertyType[] = [PropertyType.TEXT];

type PropertyFormModalProps = {
  mode: "create" | "edit" | "view";
  databaseId: string;
  property?: PropertyResponseDto;
  properties: PropertyResponseDto[];
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
  properties,
  existingGroups,
  databases,
  onClose,
  onSaved,
  onSwitchToEdit,
}: PropertyFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(mode === "create" ? 1 : 2);
  const isProtected = property?.isProtected || property?.name === "Name";
  const [name, setName] = useState(property?.name ?? "");
  const [hint, setHint] = useState(property?.hint ?? "");
  const [hintOpen, setHintOpen] = useState(Boolean(property?.hint));
  const [group, setGroup] = useState(isProtected ? "General" : (property?.groupName ?? ""));
  const [icon, setIcon] = useState(property?.icon ?? "");
  const [config, setConfig] = useState<Record<string, unknown>>(
    (property?.config as unknown as Record<string, unknown>) ?? getDefaultConfig(property?.type ?? PropertyType.TEXT),
  );
  const [selectedType, setSelectedType] = useState<PropertyType>(property?.type ?? PropertyType.TEXT);
  const [visibilityCondition, setVisibilityCondition] = useState<VisibilityConditionDto | null>(
    (property?.visibilityCondition as VisibilityConditionDto | null | undefined) ?? null,
  );

  const isViewMode = mode === "view";
  const isEditingProtected = isProtected && mode === "edit";
  const t = useTranslations("PropertyForm");
  const tMeta = useTranslations("PropertyMeta");
  const typeMeta = getTypeMeta(tMeta);

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
    isPending: isSaving,
    error: mutationError,
  } = useMutation({
    mutationFn: async () => {
      const resolvedCondition = visibilityCondition?.dependsOnPropertyName ? visibilityCondition : null;
      const payload = {
        name: name.trim(),
        hint: hint.trim() || undefined,
        group: group.trim() || undefined,
        icon: icon || undefined,
        config,
        visibilityCondition: resolvedCondition,
      };
      if (mode === "create") {
        return createProperty(databaseId, {
          ...payload,
          type: selectedType,
          position: 9999,
          visibilityCondition: resolvedCondition ?? undefined,
        });
      } else {
        return updateProperty(property!.id, { ...payload, type: selectedType });
      }
    },
    onSuccess: (saved) => {
      onSaved(saved);
      onClose();
    },
  });

  const error = mutationError ? parseApiError(mutationError) : null;

  async function handleSubmit() {
    if (!name.trim()) return;
    save();
  }

  if (!mounted) return null;

  const backdropClass = "fixed inset-0 z-overlay flex items-center justify-center backdrop-blur overlay-bg";

  if (step === 1) {
    return createPortal(
      <div className={backdropClass} onClick={onClose}>
        <div className="w-130 bg-elevated border border-stroke rounded-2xl shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
            <h2 className="type-modal-title">
              {t("addProperty")} · {t("chooseType")}
            </h2>
            <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink transition-colors duration-150">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2">
            {TYPE_ORDER.map((type) => {
              const meta = typeMeta[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-stroke hover:border-accent hover:bg-surface text-left transition-colors duration-150 group"
                >
                  <PropertyIcon
                    type={type}
                    size={15}
                    className="text-ink-muted group-hover:text-accent transition-colors duration-150 shrink-0 mt-0.5"
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
        className="w-150 max-h-[85vh] bg-elevated border border-stroke rounded-2xl shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-stroke shrink-0">
          {mode === "create" && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-ink-muted hover:text-ink transition-colors duration-150 shrink-0"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <PropertyIcon type={selectedType} size={13} className="text-ink-muted shrink-0" />
          <span className="text-sm text-ink-secondary flex-1 min-w-0 truncate">{typeMeta[selectedType].label}</span>
          {mode === "edit" && !isProtected && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-accent hover:underline shrink-0 transition-colors duration-150"
            >
              {t("change")}
            </button>
          )}
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink transition-colors duration-150 shrink-0">
            <X size={15} />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-4${isViewMode ? " pointer-events-none opacity-60" : ""}`}
        >
          <FormField
            id="property-name"
            label={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder={t("namePlaceholder")}
            autoFocus={!isViewMode}
          />

          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <p className="type-form-label mb-1.5">{t("icon")}</p>
              <IconPickerField value={icon || undefined} onChange={setIcon} placeholder={t("chooseIcon")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="type-form-label mb-1.5">{t("group")}</p>
              <Combobox
                options={existingGroups.map((groupName) => ({ value: groupName, label: groupName }))}
                value={group}
                onChange={setGroup}
                placeholder={t("groupPlaceholder")}
                freeText={!isEditingProtected}
                nullable={!isEditingProtected}
                disabled={isEditingProtected}
              />
            </div>
          </div>

          {hintOpen || hint ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="type-form-label">{t("hint")}</p>
                {!hint && (
                  <button
                    type="button"
                    onClick={() => setHintOpen(false)}
                    className="text-ink-muted hover:text-ink transition-colors duration-150"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <TextInput value={hint} onChange={setHint} placeholder={t("hintPlaceholder")} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHintOpen(true)}
              className="self-start text-xs text-ink-muted hover:text-ink-secondary transition-colors duration-150"
            >
              + {t("addHint")}
            </button>
          )}

          {!TYPES_WITHOUT_CONFIG.includes(selectedType) && (
            <div className="flex flex-col gap-4 border-t border-stroke-subtle pt-4">
              <PropertyTypeConfig
                type={selectedType}
                config={config}
                properties={properties}
                databases={databases}
                isViewMode={isViewMode}
                onPatch={patchConfig}
              />
            </div>
          )}

          {!isProtected && (
            <div className="border-t border-stroke-subtle pt-4">
              <VisibilityConditionEditor
                value={visibilityCondition}
                properties={properties}
                currentPropertyId={property?.id}
                onChange={setVisibilityCondition}
              />
            </div>
          )}
        </div>

        {error && <p className="px-5 pb-2 text-xs text-error shrink-0">{error}</p>}

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-stroke shrink-0">
          {isViewMode ? (
            <Button size="sm" onClick={() => onSwitchToEdit?.()}>
              {t("edit")}
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isSaving} loading={isSaving}>
                {mode === "create" ? t("addProperty") : t("saveChanges")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
