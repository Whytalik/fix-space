"use client";

import { PropertyIcon } from "../../_components/properties/ui/property-icon";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/actions/button";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useEscape } from "@/hooks/ui/use-escape";
import { useMutation } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api/client";
import { createProperty, updateProperty } from "@/lib/api/property";
import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PropertyTypeConfig } from "./property-type-config";
import { getDefaultConfig, getTypeMeta, TYPE_ORDER } from "@/utils/property/property-type-meta";
import { useTranslations } from "next-intl";
import { PropertyHint } from "../../_components/properties/ui/property-hint";

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
  const [group, setGroup] = useState(isProtected ? "General" : (property?.group ?? ""));
  const [icon, setIcon] = useState(property?.icon ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [config, setConfig] = useState<Record<string, unknown>>(
    (property?.config as unknown as Record<string, unknown>) ?? getDefaultConfig(property?.type ?? PropertyType.TEXT),
  );
  const [selectedType, setSelectedType] = useState<PropertyType>(property?.type ?? PropertyType.TEXT);

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
      const payload = {
        name: name.trim(),
        hint: hint.trim() || undefined,
        group: group.trim() || undefined,
        icon: icon || undefined,
        config,
      };
      if (mode === "create") {
        return createProperty(databaseId, {
          ...payload,
          type: selectedType,
          position: 9999,
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
        className="w-130 max-h-[85vh] bg-elevated border border-stroke rounded-2xl shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stroke shrink-0">
          {mode === "create" && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-ink-muted hover:text-ink transition-colors duration-150 shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <PropertyIcon type={selectedType} size={15} className="text-ink-muted shrink-0" />
          <h2 className="type-modal-title flex-1">
            {mode === "create"
              ? t("addPropertyTitle", { type: typeMeta[selectedType].label })
              : mode === "view"
                ? t("viewProperty")
                : t("editProperty")}
          </h2>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink transition-colors duration-150 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto no-scrollbar px-5 py-5 flex flex-col gap-6${isViewMode ? " pointer-events-none opacity-70" : ""}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink border-b border-stroke pb-2 text-center">{t("general")}</p>

            {mode === "edit" && (
              <div>
                <label className="type-field-label">{t("type")}</label>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-sm text-ink">
                    <PropertyIcon type={selectedType} size={14} className="text-ink-muted shrink-0" />
                    <span>{typeMeta[selectedType].label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-accent hover:underline transition-colors duration-150 shrink-0"
                  >
                    {t("change")}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="type-field-label">{t("icon")}</label>
              <div className="relative mt-1">
                <button
                  ref={iconButtonRef}
                  type="button"
                  onClick={() => setShowIconPicker((value) => !value)}
                  className="flex items-center gap-2 rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
                >
                  {icon ? (
                    <>
                      <IconDisplay value={icon} size={16} />
                      <span className="text-ink-secondary text-xs">{icon.startsWith("icon:") ? icon.slice(5) : icon}</span>
                    </>
                  ) : (
                    <span className="text-ink-muted text-xs">{t("chooseIcon")}</span>
                  )}
                </button>
                {showIconPicker && (
                  <IconPicker
                    value={icon}
                    onChange={(value) => {
                      setIcon(value);
                      setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                    anchorEl={iconButtonRef.current}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="type-field-label flex items-center gap-2">
                <span>
                  {t("name")} <span className="text-error">*</span>
                </span>
                {hint && <PropertyHint hint={hint} />}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder={t("namePlaceholder")}
                className="field-input w-full mt-1"
                autoFocus={!isViewMode}
              />
            </div>

            <div>
              <label className="type-field-label">{t("group")}</label>
              <div className="mt-1">
                <Combobox
                  options={existingGroups.map((group) => ({ value: group, label: group }))}
                  value={group}
                  onChange={setGroup}
                  placeholder={t("groupPlaceholder")}
                  freeText={!isEditingProtected}
                  nullable={!isEditingProtected}
                  disabled={isEditingProtected}
                />
              </div>
            </div>

            <div>
              <label className="type-field-label">{t("hint")}</label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder={t("hintPlaceholder")}
                className="field-input w-full mt-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink border-b border-stroke pb-2 text-center">
              {typeMeta[selectedType].label} {t("settings")}
            </p>
            <PropertyTypeConfig
              type={selectedType}
              config={config}
              properties={properties}
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
