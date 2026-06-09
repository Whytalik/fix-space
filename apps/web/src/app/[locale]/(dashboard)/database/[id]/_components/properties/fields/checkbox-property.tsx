"use client";

import { useTranslations } from "next-intl";

interface CheckboxPropertyProps {
  value: unknown;
  readOnly?: boolean;
  onChange?: (value: boolean) => void;
}

export function CheckboxProperty({ value, readOnly, onChange }: CheckboxPropertyProps) {
  const t = useTranslations("PropertyInput");
  if (readOnly) {
    return <span className={`inline-block w-4 h-4 rounded border ${value ? "bg-accent border-accent" : "border-stroke"}`} />;
  }
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="w-4 h-4 accent-accent" checked={Boolean(value)} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="text-sm text-ink-secondary">{t("checked")}</span>
    </label>
  );
}
