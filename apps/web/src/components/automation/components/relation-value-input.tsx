"use client";

import { useTranslations } from "next-intl";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useRecordsQuery } from "@/hooks/api/use-records-query";

interface RelationValueInputProps {
  relatedDbId?: string;
  value: string;
  onChange: (value: string) => void;
}

export function RelationValueInput({ relatedDbId, value, onChange }: RelationValueInputProps) {
  const t = useTranslations("Automation");
  const { data: records = [], isLoading } = useRecordsQuery(relatedDbId ?? "", { enabled: !!relatedDbId });
  const options: ComboboxOption[] = records.map((record) => ({
    value: record.id,
    label: record.name,
    icon: record.icon ?? undefined,
  }));

  if (!relatedDbId) {
    return <TextInput value={value} onChange={onChange} placeholder={t("thenSection")} />;
  }

  if (isLoading) {
    return <div className="h-8 flex items-center px-3 text-xs text-ink-secondary">{t("thenSection")}</div>;
  }

  if (records.length === 0) {
    return <TextInput value={value} onChange={onChange} placeholder={t("thenSection")} />;
  }

  return <Combobox value={value} onChange={onChange} options={options} placeholder={t("thenSection")} nullable />;
}
