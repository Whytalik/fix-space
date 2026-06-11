"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface TemplateGeneralSectionProps {
  icon: string;
  description: string | null;
  onIconChange: (value: string) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDescriptionBlur: () => void;
}

export function TemplateGeneralSection({
  icon,
  description,
  onIconChange,
  onDescriptionChange,
  onDescriptionBlur,
}: TemplateGeneralSectionProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("TemplateEdit");

  function handleToggleIconPicker() {
    setShowIconPicker((prev) => !prev);
  }

  function handleChange(value: string) {
    onIconChange(value);
    setShowIconPicker(false);
  }

  function handleClose() {
    setShowIconPicker(false);
  }

  return (
    <div className="card p-5 space-y-4">
      <span className="type-nav-label text-ink-muted block">General</span>

      <div>
        <label className="block mb-1.5 type-field-label">{t("icon")}</label>
        <button
          ref={iconButtonRef}
          type="button"
          onClick={handleToggleIconPicker}
          className="flex items-center gap-2.5 rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150 w-full"
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
        {showIconPicker && <IconPicker value={icon} onChange={handleChange} onClose={handleClose} anchorEl={iconButtonRef.current} />}
      </div>

      <div>
        <label className="block mb-1.5 type-field-label">{t("descriptionLabel")}</label>
        <textarea
          className="field-input w-full min-h-[60px] resize-none"
          value={description ?? ""}
          onChange={onDescriptionChange}
          onBlur={onDescriptionBlur}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>
    </div>
  );
}
