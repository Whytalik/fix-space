import { Injectable } from '@nestjs/common';
import {
  DEFAULT_NUMBER_PROPERTY,
  NumberProperty,
  PropertyType,
} from '@nucleus/domain';
import { PropertyTypeHandler } from '../handler.interface';

const VALID_FORMATS = ['integer', 'float', 'currency', 'percentage'];

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

    if (config.format && !VALID_FORMATS.includes(config.format as string)) {
      errors.push(`format must be one of: ${VALID_FORMATS.join(', ')}`);
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

    const typedConfig = config as unknown as NumberProperty;
    if (typedConfig.format === 'integer' && !Number.isInteger(value)) {
      return ['Value must be an integer for integer format'];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return 0;

    const num = Number(value);
    if (Number.isNaN(num)) return 0;

    const typedConfig = config as unknown as NumberProperty;
    if (typedConfig.format === 'integer') return Math.round(num);
    if (typedConfig.decimalPlaces !== undefined) {
      return parseFloat(num.toFixed(typedConfig.decimalPlaces));
    }

    return num;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config as unknown as NumberProperty).defaultValue ?? 0;
  }
}
