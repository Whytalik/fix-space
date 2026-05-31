"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";

import { TextPropertyInput } from "./inputs/text-property-input";
import { NumberPropertyInput } from "./inputs/number-property-input";
import { DatePropertyInput } from "./inputs/date-property-input";
import { CheckboxPropertyInput } from "./inputs/checkbox-property-input";
import { SelectPropertyInput } from "./inputs/select-property-input";
import { StatusPropertyInput, type StatusPropertyValue } from "./inputs/status-property-input";
import { RelationPropertyInput } from "./inputs/relation-property-input";
import { ProgressPropertyInput } from "./inputs/progress-property-input";
import { RatingPropertyInput } from "./inputs/rating-property-input";
import { FormulaPropertyInput } from "./inputs/formula-property-input";

interface PropertyInputProps {
  property: PropertyResponseDto;
  value: unknown;
  onChange: (val: unknown) => void;
  relationRecordsMap?: Record<string, RecordResponseDto[]>;
}

export function PropertyInput({ property, value, onChange, relationRecordsMap }: PropertyInputProps) {
  const t = useTranslations("PropertyInput");

  switch (property.type) {
    case PropertyType.TEXT:
      return <TextPropertyInput value={value} onChange={onChange} />;

    case PropertyType.NUMBER:
      return <NumberPropertyInput value={value} onChange={onChange} />;

    case PropertyType.DATE:
      return <DatePropertyInput value={value} onChange={onChange} />;

    case PropertyType.CHECKBOX:
      return <CheckboxPropertyInput value={value} onChange={onChange} />;

    case PropertyType.SELECT:
      return <SelectPropertyInput config={property.config} value={value} onChange={onChange} />;

    case PropertyType.STATUS: {
      const config = property.config as {
        categories?: Array<{ options: Array<{ name: string; color: string; icon?: string }> }>;
      } | null;
      const allOptions = config?.categories?.flatMap((c) => c.options) ?? [];
      const currentValue = value && typeof value === "object" ? (value as StatusPropertyValue) : null;
      return (
        <StatusPropertyInput options={allOptions} value={currentValue} onChange={onChange} placeholder={t("none")} />
      );
    }

    case PropertyType.RELATION: {
      const config = property.config as { relatedEntityId?: string; multiple?: boolean } | null;
      const records = config?.relatedEntityId ? (relationRecordsMap?.[config.relatedEntityId] ?? []) : [];
      return (
        <RelationPropertyInput
          records={records}
          multiple={config?.multiple ?? false}
          value={value}
          onChange={onChange}
        />
      );
    }

    case PropertyType.PROGRESS:
      return (
        <ProgressPropertyInput value={typeof value === "number" ? value : null} onChange={(val) => onChange(val)} />
      );

    case PropertyType.RATING:
      return <RatingPropertyInput value={typeof value === "number" ? value : null} onChange={(val) => onChange(val)} />;

    case PropertyType.FORMULA:
      return <FormulaPropertyInput />;

    default:
      return <TextPropertyInput value={value} onChange={onChange} />;
  }
}
