"use client";

import { updateDatabaseSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useDatabaseSettingsQuery } from "@/hooks/api/use-database-settings-query";
import { useUIContext } from "@/context/ui-context";
import type { DatabaseSettings as DatabaseSettingsDto } from "@fixspace/domain";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function DatabaseSettings() {
  const t = useTranslations("DatabaseSettingsComp");
  const { data: settings = null, isLoading } = useDatabaseSettingsQuery();
  const [form, setForm] = useState<DatabaseSettingsDto | null>(null);
  const { showToast } = useUIContext();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const { mutate: handleSave } = useMutation({
    mutationFn: (data: Partial<DatabaseSettingsDto>) => updateDatabaseSettings(data),
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
              {form.defaultDatabaseIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultDatabaseIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((icon) => `icon:${icon.name}` === form.defaultDatabaseIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">{t("chooseIcon")}</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultDatabaseIcon}
                onChange={(value) => {
                  setForm((prev) => (prev ? { ...prev, defaultDatabaseIcon: value } : prev));
                  handleSave({ defaultDatabaseIcon: value });
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
