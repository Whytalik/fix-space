"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PropertyHint } from "../../_components/properties/ui/property-hint";

type EditGeneralSectionProps = {
  icon: string;
  title: string;
  isLocked: boolean;
  onIconChange: (value: string) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onIsLockedChange: (value: boolean) => void;
};

export function EditGeneralSection({
  icon,
  title,
  isLocked,
  onIconChange,
  onTitleChange,
  onTitleBlur,
  onIsLockedChange,
}: EditGeneralSectionProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("DatabaseEdit");

  function handleToggleIconPicker() {
    setShowIconPicker((prev) => !prev);
  }

  function handleIconChange(value: string) {
    onIconChange(value);
    setShowIconPicker(false);
  }

  function handleIconPickerClose() {
    setShowIconPicker(false);
  }

  return (
    <section>
      <div className="rounded-2xl border border-stroke bg-elevated overflow-visible">
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
              <IconPicker value={icon} onChange={handleIconChange} onClose={handleIconPickerClose} anchorEl={iconButtonRef.current} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="type-field-label">{t("title")}</label>
              <PropertyHint hint="Name of the database as it appears in the sidebar and header" />
            </div>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={onTitleChange}
              onBlur={onTitleBlur}
              placeholder={t("placeholderTitle")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke bg-elevated overflow-visible mt-4">
        <div className="px-5 py-3 border-b border-stroke">
          <h2 className="type-panel-title">{t("isLocked")}</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">{t("isLocked")}</p>
            <p className="mt-0.5 type-hint">{t("isLockedDesc")}</p>
          </div>
          <Toggle value={isLocked} onChange={onIsLockedChange} />
        </div>
      </div>
    </section>
  );
}
