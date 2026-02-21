import { Injectable } from '@nestjs/common';
import { PropertyType } from '@nucleus/domain';
import { PropertyTypeHandler } from '../handler.interface';

@Injectable()
export class CheckboxHandler implements PropertyTypeHandler {
  readonly type = PropertyType.TEXT; // placeholder — update when CHECKBOX added to enum

  getDefaultConfig(): Record<string, unknown> {
    return { defaultValue: false };
  }

  validateConfig(_config: Record<string, unknown>): string[] | null {
    return null;
  }

  validateValue(value: unknown, _config: Record<string, unknown>): string[] | null {
    if (value !== null && typeof value !== 'boolean') {
      return ['Checkbox value must be a boolean or null'];
    }
    return null;
  }

  formatValue(value: unknown, _config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return false;
    return Boolean(value);
  }

  getDefaultValue(_config: Record<string, unknown>): unknown {
    return false;
  }
}
