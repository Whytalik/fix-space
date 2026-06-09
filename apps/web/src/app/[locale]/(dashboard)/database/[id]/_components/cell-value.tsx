"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { RecordResponseDto, PropertyResponseDto } from "@fixspace/domain";
import {
  isDatePropertyConfig,
  isDurationPropertyConfig,
  isFormulaPropertyConfig,
  isNumberPropertyConfig,
  isProgressPropertyConfig,
  isRatingPropertyConfig,
  isRelationPropertyConfig,
  isStatusPropertyConfig,
} from "@fixspace/domain";
import type { StatusPropertyValue } from "./properties/fields/status-property";
import { TextProperty } from "./properties/fields/text-property";
import { NumberProperty } from "./properties/fields/number-property";
import { DateProperty } from "./properties/fields/date-property";
import { CheckboxProperty } from "./properties/fields/checkbox-property";
import { SelectProperty } from "./properties/fields/select-property";
import { StatusProperty } from "./properties/fields/status-property";
import { RelationProperty } from "./properties/fields/relation-property";
import { DurationProperty } from "./properties/fields/duration-property";
import { RatingProperty } from "./properties/fields/rating-property";
import { ProgressProperty } from "./properties/fields/progress-property";
import { FormulaProperty } from "./properties/fields/formula-property";
import { useDatabaseContext } from "@/context/database-context";

interface CellValueProps {
  value: unknown;
  type: PropertyType;
  config: PropertyResponseDto["config"];
  relatedRecords?: RecordResponseDto[] | null;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: unknown) => void;
  ghost?: boolean;
}

export function CellValue({ value, type, config, relatedRecords, readOnly = true, className, onChange, ghost }: CellValueProps) {
  const { relatedRecordsMap } = useDatabaseContext();

  if (type === PropertyType.CHECKBOX) {
    return <CheckboxProperty value={Boolean(value)} readOnly={readOnly} onChange={onChange} />;
  }

  if (type === PropertyType.RATING) {
    return (
      <RatingProperty
        value={typeof value === "number" ? value : null}
        config={isRatingPropertyConfig(config) ? config : null}
        readOnly={readOnly}
        onChange={onChange}
      />
    );
  }

  if (type === PropertyType.PROGRESS) {
    return (
      <ProgressProperty
        value={typeof value === "number" ? value : null}
        config={isProgressPropertyConfig(config) ? config : null}
        readOnly={readOnly}
        onChange={onChange}
      />
    );
  }

  if (value === null || value === undefined || value === "") {
    if (readOnly) return <span className="text-ink-muted">—</span>;
  }

  switch (type) {
    case PropertyType.TEXT:
      return <TextProperty value={value} readOnly={readOnly} ghost={ghost} onChange={onChange as (value: string) => void} />;

    case PropertyType.NUMBER:
      return (
        <NumberProperty
          value={value}
          config={isNumberPropertyConfig(config) ? config : null}
          readOnly={readOnly}
          ghost={ghost}
          onChange={onChange as (value: number | "") => void}
        />
      );

    case PropertyType.DATE:
      return (
        <DateProperty
          value={value}
          config={isDatePropertyConfig(config) ? config : null}
          readOnly={readOnly}
          ghost={ghost}
          onChange={onChange as (value: string | null) => void}
        />
      );

    case PropertyType.SELECT:
      return (
        <SelectProperty
          config={config}
          value={value}
          readOnly={readOnly}
          ghost={ghost}
          onChange={onChange as (value: string | string[]) => void}
        />
      );

    case PropertyType.STATUS: {
      const currentValue = value && typeof value === "object" ? (value as StatusPropertyValue) : null;
      return (
        <StatusProperty
          config={isStatusPropertyConfig(config) ? config : null}
          value={currentValue}
          readOnly={readOnly}
          onChange={onChange as (value: StatusPropertyValue | null) => void}
        />
      );
    }

    case PropertyType.RELATION: {
      const relConfig = isRelationPropertyConfig(config) ? config : null;
      const targetDbId = relConfig?.relatedEntityId;
      const recordsData = targetDbId ? relatedRecordsMap[targetDbId] : relatedRecords;
      return (
        <RelationProperty
          databaseId={targetDbId}
          records={recordsData}
          multiple={relConfig?.multiple ?? false}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
        />
      );
    }

    case PropertyType.DURATION:
      return (
        <DurationProperty
          value={typeof value === "number" ? value : Number(value)}
          config={isDurationPropertyConfig(config) ? config : null}
          readOnly={readOnly}
          ghost={ghost}
          onChange={onChange as (value: number | "") => void}
        />
      );

    case PropertyType.FORMULA:
      return <FormulaProperty value={value} config={isFormulaPropertyConfig(config) ? config : null} readOnly />;

    default:
      return <span className={`text-ink text-sm truncate max-w-50 ${className || ""}`}>{String(value)}</span>;
  }
}
