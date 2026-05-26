"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Combobox, type ComboboxOption } from "@/components/ui/primitives/combobox";
import { Toggle } from "@/components/ui/primitives/toggle";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

type EditGeneralSectionProps = {
  icon: string;
  title: string;
  recordLimit: number | null;
  useDefaultTemplate: boolean;
  wrapCells: boolean;
  onIconChange: (val: string) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onRecordLimitChange: (val: number | null) => void;
  onUseDefaultTemplateChange: (val: boolean) => void;
  onWrapCellsChange: (val: boolean) => void;
};

const RECORD_LIMIT_OPTIONS: ComboboxOption[] = [
  { value: "", label: "No limit" },
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "75", label: "75" },
  { value: "100", label: "100" },
];

export function EditGeneralSection({
  icon,
  title,
  recordLimit,
  useDefaultTemplate,
  wrapCells,
  onIconChange,
  onTitleChange,
  onTitleBlur,
  onRecordLimitChange,
  onUseDefaultTemplateChange,
  onWrapCellsChange,
}: EditGeneralSectionProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("DatabaseEdit");

  function handleToggleIconPicker() {
    setShowIconPicker((v) => !v);
  }

  function handleIconChange(val: string) {
    onIconChange(val);
    setShowIconPicker(false);
  }

  function handleIconPickerClose() {
    setShowIconPicker(false);
  }

  return (
    <section>
      <div className="rounded-xl border border-stroke bg-elevated overflow-visible">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">{t("general")}</h2>
        </div>

        <div className="px-5 py-4 flex items-start gap-4">
          <div className="shrink-0">
            <label className="block mb-1.5 type-field-label">{t("icon")}</label>
            <button
              ref={iconButtonRef}
              type="button"
              onClick={handleToggleIconPicker}
              className="flex items-center gap-2.5 rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
            >
              {icon ? (
                <>
                  <IconDisplay value={icon} size={18} />
                  <span className="text-ink-secondary text-xs">{icon.startsWith("icon:") ? icon.slice(5) : icon}</span>
                </>
              ) : (
                <span className="text-ink-muted">{t("chooseIcon")}</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={icon}
                onChange={handleIconChange}
                onClose={handleIconPickerClose}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <label className="block mb-1.5 type-field-label">{t("title")}</label>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={onTitleChange}
              onBlur={onTitleBlur}
              placeholder={t("placeholderTitle")}
            />
            <p className="mt-1.5 type-hint">
              {t("internalName")}:{" "}
              <span className="font-mono text-ink-secondary">[DB] {title || "Trading Journal"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">{t("limits")}</h2>
        </div>
        <div className="px-5 py-4">
          <label className="block mb-1.5 type-field-label">{t("recordLimit")}</label>
          <Combobox
            options={RECORD_LIMIT_OPTIONS.map((opt) => ({
              ...opt,
              label: opt.value === "" ? t("noLimit") : opt.label,
            }))}
            value={recordLimit === null ? "" : String(recordLimit)}
            onChange={(v) => onRecordLimitChange(v === "" ? null : Number(v))}
            placeholder={t("noLimit")}
            nullable
          />
          <p className="mt-1.5 type-hint">{t("recordLimitDesc")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">{t("templates")}</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">{t("useDefaultTemplate")}</p>
            <p className="mt-0.5 type-hint">{t("useDefaultTemplateDesc")}</p>
          </div>
          <Toggle value={useDefaultTemplate} onChange={onUseDefaultTemplateChange} />
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">{t("view")}</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">{t("wrapCells")}</p>
            <p className="mt-0.5 type-hint">{t("wrapCellsDesc")}</p>
          </div>
          <Toggle value={wrapCells} onChange={onWrapCellsChange} />
        </div>
      </div>
    </section>
  );
}
