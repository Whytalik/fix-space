"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface CheckboxPropertyProps {
  value: unknown;
  readOnly?: boolean;
  onChange?: (value: boolean) => void;
}

export function CheckboxProperty({ value, readOnly, onChange }: CheckboxPropertyProps) {
  const t = useTranslations("PropertyInput");
  const checked = Boolean(value);

  if (readOnly) {
    return (
      <span
        className={`inline-flex w-4 h-4 rounded border items-center justify-center shrink-0 ${
          checked ? "bg-accent border-accent" : "border-stroke bg-transparent"
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
    );
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span
        onClick={() => onChange?.(!checked)}
        className={`inline-flex w-4 h-4 rounded border items-center justify-center shrink-0 cursor-pointer transition-colors duration-150 ${
          checked ? "bg-accent border-accent" : "border-stroke bg-transparent hover:border-accent/50"
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      <span className="text-sm text-ink-secondary">{t("checked")}</span>
    </label>
  );
}
