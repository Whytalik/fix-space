import { Injectable } from '@nestjs/common';
import { DEFAULT_RELATION_PROPERTY, PropertyType } from '@nucleus/domain';
import { PropertyTypeHandler } from '../handler.interface';

@Injectable()
export class RelationHandler implements PropertyTypeHandler {
  readonly type = PropertyType.RELATION;

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_RELATION_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.relatedEntityId !== undefined && typeof config.relatedEntityId !== 'string') {
      errors.push('relatedEntityId must be a string');
    }

    if (config.multiple !== undefined && typeof config.multiple !== 'boolean') {
      errors.push('multiple must be a boolean');
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    const isMultiple = config.multiple as boolean | undefined;

    if (isMultiple) {
      if (!Array.isArray(value)) {
        return ['Relation value must be an array of ID strings or null'];
      }

      if ((value as unknown[]).some((v) => typeof v !== 'string')) {
        return ['All relation IDs must be strings'];
      }
    } else {
      if (typeof value !== 'string') {
        return ['Relation value must be a string ID or null'];
      }
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) {
      return (config.multiple as boolean | undefined) ? [] : null;
    }
    return value;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.multiple as boolean | undefined) ? [] : null;
  }
}
