"use client";

import { getSectionSettings, updateSectionSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/primitives/button";
import { Spinner } from "@/components/ui/primitives/spinner";
import { Toast } from "@/components/ui/primitives/toast";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type { SectionSettings } from "@nucleus/domain";
import { useEffect, useRef, useState } from "react";

type ToastState = { message: string; variant: "success" | "error" } | null;

export function SectionSettings() {
  const [form, setForm] = useState<SectionSettings | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getSectionSettings()
      .then(setForm)
      .finally(() => setIsFetching(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await updateSectionSettings(form);
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
              {form.defaultSectionIcon ? (
                <span className="flex items-center gap-2">
                  <IconDisplay value={form.defaultSectionIcon} size={16} />
                  <span className="text-xs text-ink-secondary">
                    {getAllIcons().find((i) => `icon:${i.name}` === form.defaultSectionIcon)?.displayName}
                  </span>
                </span>
              ) : (
                <span className="text-ink-muted">Choose an icon…</span>
              )}
            </button>
            {showIconPicker && (
              <IconPicker
                value={form.defaultSectionIcon}
                onChange={(v) => {
                  setForm((p) => (p ? { ...p, defaultSectionIcon: v } : p));
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-ink-secondary">Default color</label>
          <button
            ref={swatchRef}
            type="button"
            onClick={() => setColorPickerOpen((o) => !o)}
            className="flex items-center gap-2 w-fit rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:bg-elevated transition-colors"
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
              onChange={(v) => setForm((p) => (p ? { ...p, defaultSectionColor: v } : p))}
              onClose={() => setColorPickerOpen(false)}
              anchorEl={swatchRef.current}
            />
          )}
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
