"use client";

import { useTranslations } from "next-intl";

interface SelectPropertyInputProps {
  config: unknown;
  value: unknown;
  onChange: (val: string) => void;
}

export function SelectPropertyInput({ config, value, onChange }: SelectPropertyInputProps) {
  const t = useTranslations("PropertyInput");
  const parsedConfig = config as { categories?: Array<{ label: string; options: string[] }> } | null;
  const options = parsedConfig?.categories?.flatMap((c) => c.options) ?? [];

  return (
    <select
      className="field-input cursor-pointer"
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{t("none")}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
