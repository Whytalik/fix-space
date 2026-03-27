"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Combobox, type ComboboxOption } from "@/components/ui/primitives/combobox";
import { Toggle } from "@/components/ui/primitives/toggle";
import { useRef, useState } from "react";

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
          <h2 className="type-panel-title">General</h2>
        </div>

        <div className="px-5 py-4 flex items-start gap-4">
          <div className="shrink-0">
            <label className="block mb-1.5 type-field-label">Icon</label>
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
                <span className="text-ink-muted">Choose an icon…</span>
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
            <label className="block mb-1.5 type-field-label">Title</label>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={onTitleChange}
              onBlur={onTitleBlur}
              placeholder="e.g. Trading Journal"
            />
            <p className="mt-1.5 type-hint">
              Internal name: <span className="font-mono text-ink-secondary">[DB] {title || "Trading Journal"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">Limits</h2>
        </div>
        <div className="px-5 py-4">
          <label className="block mb-1.5 type-field-label">Record limit</label>
          <Combobox
            options={RECORD_LIMIT_OPTIONS}
            value={recordLimit === null ? "" : String(recordLimit)}
            onChange={(v) => onRecordLimitChange(v === "" ? null : Number(v))}
            placeholder="No limit"
            nullable
          />
          <p className="mt-1.5 type-hint">Maximum number of records allowed in this database, or no limit.</p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">Templates</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">Use default template</p>
            <p className="mt-0.5 type-hint">Automatically apply the default template when creating new records.</p>
          </div>
          <Toggle value={useDefaultTemplate} onChange={onUseDefaultTemplateChange} />
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">View</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">Wrap cell content</p>
            <p className="mt-0.5 type-hint">Allow cell text to wrap to multiple lines instead of being truncated.</p>
          </div>
          <Toggle value={wrapCells} onChange={onWrapCellsChange} />
        </div>
      </div>
    </section>
  );
}
