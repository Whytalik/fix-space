"use client";

import { useTranslations } from "next-intl";

interface CheckboxPropertyInputProps {
  value: unknown;
  onChange: (val: boolean) => void;
}

export function CheckboxPropertyInput({ value, onChange }: CheckboxPropertyInputProps) {
  const t = useTranslations("PropertyInput");
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="w-4 h-4 accent-accent" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-ink-secondary">{t("checked")}</span>
    </label>
  );
}
