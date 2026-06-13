import { PropertyType, SummaryMetric } from "@fixspace/domain/enums";
import type { RecordResponseDto } from "@fixspace/domain";

export function calculateSummary(
  records: RecordResponseDto[],
  propertyId: string,
  type: PropertyType,
  metric: SummaryMetric,
  isPrimary: boolean = false,
): string | number | null {
  if (records.length === 0 && metric !== SummaryMetric.COUNT) return null;

  const values = records.map((record) => {
    const propValue = record.values?.find((v) => v.propertyId === propertyId);
    let resolvedValue = propValue?.value;

    if (isPrimary && (resolvedValue === null || resolvedValue === undefined || resolvedValue === "")) {
      resolvedValue = record.name;
    }
    return resolvedValue;
  });

  const filledValues = values.filter((v) => v !== null && v !== undefined && v !== "");

  switch (metric) {
    case SummaryMetric.COUNT:
      return records.length;
    case SummaryMetric.COUNT_FILLED:
      return filledValues.length;
    case SummaryMetric.COUNT_EMPTY:
      return records.length - filledValues.length;

    case SummaryMetric.CHECKED:
      return values.filter((v) => Boolean(v)).length;
    case SummaryMetric.UNCHECKED:
      return values.filter((v) => !v).length;
    case SummaryMetric.PERCENT_CHECKED: {
      if (records.length === 0) return "0%";
      const checked = values.filter((v) => Boolean(v)).length;
      return `${Math.round((checked / records.length) * 100)}%`;
    }

    case SummaryMetric.SUM: {
      const nums = filledValues.map(Number).filter((n) => !isNaN(n));
      return nums.reduce((a, b) => a + b, 0);
    }
    case SummaryMetric.AVERAGE: {
      const nums = filledValues.map(Number).filter((n) => !isNaN(n));
      if (nums.length === 0) return 0;
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    case SummaryMetric.MEDIAN: {
      const nums = filledValues
        .map(Number)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      if (nums.length === 0) return 0;
      const mid = Math.floor(nums.length / 2);
      if (nums.length % 2 !== 0) return nums[mid] ?? 0;
      const val1 = nums[mid - 1] ?? 0;
      const val2 = nums[mid] ?? 0;
      return (val1 + val2) / 2;
    }
    case SummaryMetric.MIN: {
      if (type === PropertyType.DATE) {
        const dates = filledValues.map((v) => new Date(v as string).getTime()).filter((timestamp) => !isNaN(timestamp));
        if (dates.length === 0) return null;
        return new Date(Math.min(...dates)).toISOString();
      }
      const nums = filledValues.map(Number).filter((n) => !isNaN(n));
      if (nums.length === 0) return 0;
      return Math.min(...nums);
    }
    case SummaryMetric.MAX: {
      if (type === PropertyType.DATE) {
        const dates = filledValues.map((v) => new Date(v as string).getTime()).filter((timestamp) => !isNaN(timestamp));
        if (dates.length === 0) return null;
        return new Date(Math.max(...dates)).toISOString();
      }
      const nums = filledValues.map(Number).filter((n) => !isNaN(n));
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    }
    case SummaryMetric.RANGE: {
      const nums = filledValues.map(Number).filter((n) => !isNaN(n));
      if (nums.length === 0) return 0;
      return Math.max(...nums) - Math.min(...nums);
    }

    case SummaryMetric.UNIQUE: {
      const unique = new Set(filledValues.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)));
      return unique.size;
    }

    case SummaryMetric.EARLIEST: {
      const dates = filledValues.map((v) => new Date(v as string).getTime()).filter((timestamp) => !isNaN(timestamp));
      if (dates.length === 0) return null;
      return new Date(Math.min(...dates)).toISOString();
    }
    case SummaryMetric.LATEST: {
      const dates = filledValues.map((v) => new Date(v as string).getTime()).filter((timestamp) => !isNaN(timestamp));
      if (dates.length === 0) return null;
      return new Date(Math.max(...dates)).toISOString();
    }
    case SummaryMetric.DATE_RANGE: {
      const dates = filledValues.map((v) => new Date(v as string).getTime()).filter((timestamp) => !isNaN(timestamp));
      if (dates.length < 2) return null;
      const min = Math.min(...dates);
      const max = Math.max(...dates);
      const diffDays = Math.ceil((max - min) / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    default:
      return null;
  }
}

export function getAvailableMetrics(type: PropertyType): SummaryMetric[] {
  const common = [SummaryMetric.COUNT, SummaryMetric.COUNT_FILLED, SummaryMetric.COUNT_EMPTY];

  switch (type) {
    case PropertyType.NUMBER:
    case PropertyType.DURATION:
    case PropertyType.RATING:
    case PropertyType.PROGRESS:
    case PropertyType.FORMULA:
      return [
        ...common,
        SummaryMetric.SUM,
        SummaryMetric.AVERAGE,
        SummaryMetric.MEDIAN,
        SummaryMetric.MIN,
        SummaryMetric.MAX,
        SummaryMetric.RANGE,
      ];

    case PropertyType.CHECKBOX:
      return [...common, SummaryMetric.CHECKED, SummaryMetric.UNCHECKED, SummaryMetric.PERCENT_CHECKED];

    case PropertyType.SELECT:
    case PropertyType.STATUS:
    case PropertyType.RELATION:
      return [...common, SummaryMetric.UNIQUE];

    case PropertyType.DATE:
      return [...common, SummaryMetric.EARLIEST, SummaryMetric.LATEST, SummaryMetric.DATE_RANGE];

    default:
      return common;
  }
}
