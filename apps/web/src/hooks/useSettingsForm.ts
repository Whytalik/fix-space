"use client";

import { parseApiError } from "@/lib/api/client";
import { useState } from "react";

type ToastState = { message: string; variant: "success" | "error" } | null;

interface UseSettingsFormOptions<T> {
  fetchFn: () => Promise<T>;
  saveFn: (data: T) => Promise<T>;
}

export function useSettingsForm<T extends object>({ fetchFn, saveFn }: UseSettingsFormOptions<T>) {
  const [form, setForm] = useState<T | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  function fetch() {
    fetchFn()
      .then(setForm)
      .finally(() => setIsFetching(false));
  }

  async function save(successMessage: string) {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await saveFn(form);
      setForm(updated);
      setToast({ message: successMessage, variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof T>(key: K, value: T[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function dismissToast() {
    setToast(null);
  }

  return { form, isFetching, isSaving, toast, fetch, save, updateField, dismissToast, setForm };
}
