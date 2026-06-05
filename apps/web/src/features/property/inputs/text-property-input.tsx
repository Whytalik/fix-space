"use client";

import { useTranslations } from "next-intl";

interface TextPropertyInputProps {
  value: unknown;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function TextPropertyInput({ value, onChange, placeholder }: TextPropertyInputProps) {
  const t = useTranslations("PropertyInput");
  return (
    <input
      type="text"
      className="field-input"
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || t("enterText")}
    />
  );
}
