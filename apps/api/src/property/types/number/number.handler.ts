import { Injectable } from '@nestjs/common';
import {
  DEFAULT_NUMBER_PROPERTY,
  NUMBER_FORMAT_VALUES,
  NumberFormat,
  PropertyType,
} from '@nucleus/domain';
import { PropertyTypeHandler } from '../handler.interface';

@Injectable()
export class NumberHandler implements PropertyTypeHandler {
  readonly type = PropertyType.NUMBER;

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_NUMBER_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (
      config.defaultValue !== undefined &&
      typeof config.defaultValue !== 'number'
    ) {
      errors.push('defaultValue must be a number');
    }

    if (
      config.format &&
      !NUMBER_FORMAT_VALUES.includes(config.format as NumberFormat)
    ) {
      errors.push(`format must be one of: ${NUMBER_FORMAT_VALUES.join(', ')}`);
    }

    if (config.decimalPlaces !== undefined) {
      if (
        typeof config.decimalPlaces !== 'number' ||
        config.decimalPlaces < 0 ||
        config.decimalPlaces > 10
      ) {
        errors.push('decimalPlaces must be a number between 0 and 10');
      }
    }

    if (
      config.currencySymbol !== undefined &&
      typeof config.currencySymbol !== 'string'
    ) {
      errors.push('currencySymbol must be a string');
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(
    value: unknown,
    config: Record<string, unknown>,
  ): string[] | null {
    if (value === null) return null;

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return ['Number value must be a number or null'];
    }

    if (
      (config.format as NumberFormat | undefined) === 'integer' &&
      !Number.isInteger(value)
    ) {
      return ['Value must be an integer for integer format'];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return 0;

    const num = Number(value);
    if (Number.isNaN(num)) return 0;

    const format = config.format as NumberFormat | undefined;
    const decimalPlaces = config.decimalPlaces as number | undefined;

    if (format === 'integer') return Math.round(num);
    if (decimalPlaces !== undefined)
      return parseFloat(num.toFixed(decimalPlaces));

    return num;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.defaultValue as number | undefined) ?? 0;
  }
}
