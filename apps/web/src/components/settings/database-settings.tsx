"use client";

import { getDatabaseSettings, updateDatabaseSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/primitives/button";
import { Spinner } from "@/components/ui/primitives/spinner";
import { Toast } from "@/components/ui/primitives/toast";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type { DatabaseSettings as DatabaseSettingsDto } from "@fixspace/domain";
import { useEffect, useRef, useState } from "react";

type ToastState = { message: string; variant: "success" | "error" } | null;

export function DatabaseSettings() {
  const [form, setForm] = useState<DatabaseSettingsDto | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getDatabaseSettings()
      .then(setForm)
      .finally(() => setIsFetching(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await updateDatabaseSettings(form);
      setForm(updated);
      setToast({ message: "Settings saved.", variant: "success" });
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
          <label className="text-sm text-ink-secondary">Default icon</label>
          <div>
            <button
              ref={iconButtonRef}
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
            >
              {form.defaultDatabaseIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultDatabaseIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((i) => `icon:${i.name}` === form.defaultDatabaseIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">Choose an icon…</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultDatabaseIcon}
                onChange={(v) => {
                  setForm((p) => (p ? { ...p, defaultDatabaseIcon: v } : p));
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
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
