"use client";

import { useUpdateTemplateSettings, useTemplateSettingsQuery } from "@/hooks/api/use-template-settings-query";
import { parseApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useUIContext } from "@/context/ui-context";
import type { TemplateSettings as TemplateSettingsDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function TemplateSettings() {
  const t = useTranslations("TemplateSettingsComp");
  const { data: settings = null, isLoading } = useTemplateSettingsQuery();
  const [form, setForm] = useState<TemplateSettingsDto | null>(null);
  const { showToast } = useUIContext();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const updateMutation = useUpdateTemplateSettings();

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = (data: Partial<TemplateSettingsDto>) => {
    updateMutation.mutate(data, {
      onSuccess: (updated) => {
        setForm(updated);
        showToast(t("settingsSaved"), "success");
      },
      onError: (error) => {
        showToast(parseApiError(error), "error");
      },
    });
  };

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
              {form.defaultTemplateIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultTemplateIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((icon) => `icon:${icon.name}` === form.defaultTemplateIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">{t("chooseIcon")}</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultTemplateIcon}
                onChange={(value) => {
                  setForm((prev) => (prev ? { ...prev, defaultTemplateIcon: value } : prev));
                  handleSave({ defaultTemplateIcon: value });
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
