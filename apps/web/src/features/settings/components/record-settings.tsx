"use client";

import { getRecordSettings, updateRecordSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { Toast } from "@/components/ui/primitives/feedback/toast";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type { RecordSettings as RecordSettingsDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type ToastState = { message: string; variant: "success" | "error" } | null;

export function RecordSettings() {
  const t = useTranslations("RecordSettingsComp");
  const [form, setForm] = useState<RecordSettingsDto | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getRecordSettings()
      .then(setForm)
      .finally(() => setIsFetching(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await updateRecordSettings(form);
      setForm(updated);
      setToast({ message: t("settingsSaved"), variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching || !form) {
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
              onClick={() => setShowIconPicker((v) => !v)}
              className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
            >
              {form.defaultRecordIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultRecordIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((i) => `icon:${i.name}` === form.defaultRecordIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">{t("chooseIcon")}</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultRecordIcon}
                onChange={(v) => {
                  setForm((p) => (p ? { ...p, defaultRecordIcon: v } : p));
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
