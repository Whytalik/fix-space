"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/button";
import { Toggle } from "@/components/ui/primitives/toggle";
import { Copy, Layers, Trash2 } from "lucide-react";
import type React from "react";
import { useTranslations } from "next-intl";

type TemplateHeaderProps = {
  isSaving: boolean;
  nameValue: string;
  iconValue: string;
  isDefault: boolean;
  showIconPicker: boolean;
  iconButtonRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onOpenDelete: () => void;
  onNameChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onIsDefaultChange: (v: boolean) => void;
  onIconPickerToggle: () => void;
  onIconPickerClose: () => void;
};

export function TemplateHeader({
  isSaving,
  nameValue,
  iconValue,
  isDefault,
  showIconPicker,
  iconButtonRef,
  onBack,
  onSave,
  onDuplicate,
  onOpenDelete,
  onNameChange,
  onIconChange,
  onIsDefaultChange,
  onIconPickerToggle,
  onIconPickerClose,
}: TemplateHeaderProps) {
  const t = useTranslations("TemplatePage");
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          ref={iconButtonRef}
          type="button"
          onClick={onIconPickerToggle}
          className="text-[2.25rem] leading-none shrink-0 hover:opacity-70 transition-opacity duration-150 cursor-pointer"
          title={t("changeIcon")}
        >
          {iconValue ? <IconDisplay value={iconValue} size={45} /> : <Layers size={45} />}
        </button>
        {showIconPicker && (
          <IconPicker
            value={iconValue}
            onChange={(val) => {
              onIconChange(val);
              onIconPickerClose();
            }}
            onClose={onIconPickerClose}
            anchorEl={iconButtonRef.current}
          />
        )}
        <input
          type="text"
          className="flex-1 min-w-0 bg-transparent text-[2.5rem] font-bold leading-[1.1] tracking-tight text-ink border-b border-stroke focus:border-accent outline-none transition-colors duration-150 pb-1"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t("untitledTemplate")}
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">{t("defaultTemplate")}</span>
          <Toggle value={isDefault} onChange={onIsDefaultChange} />
        </div>
        <Button variant="primary" size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onDuplicate}
          title="Duplicate template"
          disabled={isSaving}
          className="p-2.5!"
        >
          <Copy size={16} />
        </Button>
        <Button size="icon" variant="danger" onClick={onOpenDelete} title="Delete template" className="p-2.5!">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
