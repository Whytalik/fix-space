"use client";

import { updateSectionSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useSectionSettingsQuery } from "@/hooks/api/use-section-settings-query";
import { useUIContext } from "@/context/ui-context";
import type { SectionSettings as SectionSettingsDto } from "@fixspace/domain";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function SectionSettings() {
  const t = useTranslations("SectionSettingsComp");
  const { data: settings = null, isLoading } = useSectionSettingsQuery();
  const [form, setForm] = useState<SectionSettingsDto | null>(null);
  const { showToast } = useUIContext();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const { mutate: handleSave } = useMutation({
    mutationFn: (data: Partial<SectionSettingsDto>) => updateSectionSettings(data),
    onSuccess: (updated) => {
      setForm(updated);
      showToast(t("settingsSaved"), "success");
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
    },
  });

  if (isLoading || !form) {
    return <Spinner size="sm" className="mx-auto mt-4" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-ink-secondary">{t("defaultIcon")}</label>
          <div>
            <button
              ref={iconButtonRef}
              type="button"
              onClick={() => setShowIconPicker((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
            >
              {form.defaultSectionIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultSectionIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((icon) => `icon:${icon.name}` === form.defaultSectionIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">{t("chooseIcon")}</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultSectionIcon}
                onChange={(value) => {
                  setForm((prev) => (prev ? { ...prev, defaultSectionIcon: value } : prev));
                  handleSave({ defaultSectionIcon: value });
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-ink-secondary">{t("defaultColor")}</label>
          <button
            ref={swatchRef}
            type="button"
            onClick={() => setColorPickerOpen((prev) => !prev)}
            className="flex items-center gap-2 w-fit rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:bg-elevated transition-colors duration-150"
          >
            <span
              className="w-4 h-4 rounded-sm border border-stroke/50 shrink-0"
              style={{ backgroundColor: form.defaultSectionColor || "transparent" }}
            />
            <span className="font-mono text-xs text-ink-secondary">{form.defaultSectionColor || "none"}</span>
          </button>
          {colorPickerOpen && (
            <ColorPicker
              value={form.defaultSectionColor}
              onChange={(value) => {
                setForm((prev) => (prev ? { ...prev, defaultSectionColor: value } : prev));
                handleSave({ defaultSectionColor: value });
              }}
              onClose={() => setColorPickerOpen(false)}
              anchorEl={swatchRef.current}
            />
          )}
        </div>
      </div>
    </div>
  );
}
