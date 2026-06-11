import { Injectable } from "@nestjs/common";

import { AutomationFilterOperator, AutomationWriteMode, FieldChangeConditionType, PropertyType, ValueType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";

export interface RecordForAutomation {
  id: string;
  databaseId: string;
  values?: Array<{ propertyId: string; value: unknown }>;
}

@Injectable()
export class AutomationEngine {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(AutomationEngine.name);
  }

  evaluateFieldChangeCondition(
    config: { propertyId: string; condition?: { type: string; value?: unknown } } | null | undefined,
    changedPropertyId: string,
    oldValue: unknown,
    newValue: unknown,
  ): boolean {
    if (!config?.propertyId || config.propertyId !== changedPropertyId) return false;
    if (!config.condition) return true;

    const { type, value } = config.condition;
    switch (type) {
      case FieldChangeConditionType.EQUALS:
        return this.deepEqual(newValue, value);
      case FieldChangeConditionType.BECOMES_SET:
        return this.isEmpty(oldValue) && !this.isEmpty(newValue);
      case FieldChangeConditionType.BECOMES_UNSET:
        return !this.isEmpty(oldValue) && this.isEmpty(newValue);
      default:
        this.logger.warn("Unknown field change condition type", { type });
        return false;
    }
  }

  resolveValue(descriptor: { valueType: string; value?: unknown; fieldRef?: string }, triggerRecord?: RecordForAutomation): unknown {
    switch (descriptor.valueType) {
      case ValueType.FIXED:
        return descriptor.value ?? null;
      case ValueType.TODAY:
        return new Date().toISOString().split("T")[0];
      case ValueType.FIELD_REF:
        if (!triggerRecord || !descriptor.fieldRef) return null;
        return this.getRecordValue(triggerRecord, descriptor.fieldRef);
      default:
        return null;
    }
  }

  shouldSkipFilters(
    filters: Array<{ valueType: string; fieldRef?: string; fieldRefEnd?: string; operator: string }>,
    triggerRecord: RecordForAutomation,
  ): boolean {
    for (const filter of filters) {
      if (filter.valueType === ValueType.FIELD_REF && filter.fieldRef) {
        if (this.isEmpty(this.getRecordValue(triggerRecord, filter.fieldRef))) return true;
      }
      if (filter.operator === AutomationFilterOperator.BETWEEN && filter.fieldRefEnd) {
        if (this.isEmpty(this.getRecordValue(triggerRecord, filter.fieldRefEnd))) return true;
      }
    }
    return false;
  }

  matchesFilters(
    candidate: RecordForAutomation,
    filters: Array<{ propertyId: string; operator: string; valueType: string; value?: unknown; fieldRef?: string; fieldRefEnd?: string }>,
    triggerRecord: RecordForAutomation,
  ): boolean {
    return filters.every((filter) => this.matchFilter(candidate, filter, triggerRecord));
  }

  isTypeCompatible(targetType: PropertyType, valueType: string, sourceType?: PropertyType): boolean {
    if (targetType === PropertyType.FORMULA) return false;
    if (valueType === ValueType.TODAY) return targetType === PropertyType.DATE;
    if (valueType === ValueType.FIXED) return targetType !== PropertyType.RELATION;
    if (valueType === ValueType.FIELD_REF && sourceType) return this.isFieldRefCompatible(targetType, sourceType);
    return true;
  }

  getRecordValue(record: RecordForAutomation, propertyId: string): unknown {
    return record.values?.find((propertyValue) => propertyValue.propertyId === propertyId)?.value ?? null;
  }

  private matchFilter(
    candidate: RecordForAutomation,
    filter: { propertyId: string; operator: string; valueType: string; value?: unknown; fieldRef?: string; fieldRefEnd?: string },
    triggerRecord: RecordForAutomation,
  ): boolean {
    const candidateValue = this.getRecordValue(candidate, filter.propertyId);

    switch (filter.operator) {
      case AutomationFilterOperator.IS_EMPTY:
        return this.isEmpty(candidateValue);
      case AutomationFilterOperator.IS_NOT_EMPTY:
        return !this.isEmpty(candidateValue);
      case AutomationFilterOperator.EQUALS: {
        const filterValue = this.resolveValue(filter, triggerRecord);
        return this.deepEqual(candidateValue, filterValue);
      }
      case AutomationFilterOperator.BETWEEN: {
        const start = filter.fieldRef ? this.getRecordValue(triggerRecord, filter.fieldRef) : null;
        const end = filter.fieldRefEnd ? this.getRecordValue(triggerRecord, filter.fieldRefEnd) : null;
        return this.isBetween(candidateValue, start, end);
      }
      default:
        return false;
    }
  }

  private isBetween(value: unknown, start: unknown, end: unknown): boolean {
    if (this.isEmpty(value) || this.isEmpty(start) || this.isEmpty(end)) return false;
    const v = String(value);
    return v >= String(start) && v <= String(end);
  }

  private isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === "";
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  private isFieldRefCompatible(target: PropertyType, source: PropertyType): boolean {
    const compat: Partial<Record<PropertyType, PropertyType[]>> = {
      [PropertyType.TEXT]: [PropertyType.TEXT],
      [PropertyType.NUMBER]: [PropertyType.NUMBER, PropertyType.RATING, PropertyType.PROGRESS],
      [PropertyType.DATE]: [PropertyType.DATE],
      [PropertyType.CHECKBOX]: [PropertyType.CHECKBOX],
      [PropertyType.SELECT]: [PropertyType.SELECT, PropertyType.STATUS],
      [PropertyType.STATUS]: [PropertyType.STATUS, PropertyType.SELECT],
      [PropertyType.RATING]: [PropertyType.RATING, PropertyType.NUMBER],
      [PropertyType.PROGRESS]: [PropertyType.PROGRESS, PropertyType.NUMBER],
      [PropertyType.RELATION]: [PropertyType.RELATION],
      [PropertyType.DURATION]: [PropertyType.DURATION],
    };
    return compat[target]?.includes(source) ?? false;
  }

  buildWriteModeDescription(writeMode: string): string {
    return writeMode === AutomationWriteMode.APPEND ? "append" : "replace";
  }
}
