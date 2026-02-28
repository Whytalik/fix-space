import { Injectable } from '@nestjs/common';
import { DEFAULT_SELECT_PROPERTY, PropertyType } from '@nucleus/domain';
import { PropertyTypeHandler } from '../handler.interface';

@Injectable()
export class SelectHandler implements PropertyTypeHandler {
  readonly type = PropertyType.SELECT;

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_SELECT_PROPERTY, options: [] };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.isMultiSelect !== undefined && typeof config.isMultiSelect !== 'boolean') {
      errors.push('isMultiSelect must be a boolean');
    }

    if (config.options !== undefined) {
      if (!Array.isArray(config.options)) {
        errors.push('options must be an array of strings');
      } else if ((config.options as unknown[]).some((o) => typeof o !== 'string')) {
        errors.push('each option must be a string');
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    const options = config.options as string[] | undefined;
    const isMulti = config.isMultiSelect as boolean | undefined;

    if (isMulti) {
      if (!Array.isArray(value)) {
        return ['Multi-select value must be an array of strings or null'];
      }

      const arr = value as unknown[];

      if (arr.some((v) => typeof v !== 'string')) {
        return ['Multi-select values must be strings'];
      }

      if (options) {
        const invalid = (arr as string[]).filter((v) => !options.includes(v));
        if (invalid.length > 0) {
          return [`Invalid options: ${invalid.join(', ')}. Must be one of: ${options.join(', ')}`];
        }
      }
    } else {
      if (typeof value !== 'string') {
        return ['Select value must be a string or null'];
      }

      if (options && !options.includes(value)) {
        return [`Value must be one of the defined options: ${options.join(', ')}`];
      }
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) {
      return (config.isMultiSelect as boolean | undefined) ? [] : null;
    }
    return value;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.isMultiSelect as boolean | undefined) ? [] : null;
  }
}
