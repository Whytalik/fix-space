import { Injectable } from "@nestjs/common";
import {
  BUTTON_ACTION_TYPE_VALUES,
  BUTTON_COLOR_VALUES,
  ButtonActionType,
  ButtonColor,
  ButtonProperty,
  DEFAULT_BUTTON_PROPERTY,
  FilterOperator,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class ButtonHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.BUTTON;

  private parseConfig(config: Record<string, unknown>): ButtonProperty {
    return config as unknown as ButtonProperty;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_BUTTON_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.label !== undefined && typeof config.label !== "string") {
      errors.push("label must be a string");
    }

    if (config.color !== undefined && !BUTTON_COLOR_VALUES.includes(config.color as ButtonColor)) {
      errors.push(`color must be one of: ${BUTTON_COLOR_VALUES.join(", ")}`);
    }

    if (config.confirmDialog !== undefined && typeof config.confirmDialog !== "boolean") {
      errors.push("confirmDialog must be a boolean");
    }

    if (config.actions !== undefined) {
      if (!Array.isArray(config.actions)) {
        errors.push("actions must be an array");
      } else {
        for (const action of config.actions as unknown[]) {
          if (typeof action !== "object" || action === null) {
            errors.push("each action must be an object");
            continue;
          }
          const actionRecord = action as Record<string, unknown>;
          if (!BUTTON_ACTION_TYPE_VALUES.includes(actionRecord.type as ButtonActionType)) {
            errors.push(`action.type must be one of: ${BUTTON_ACTION_TYPE_VALUES.join(", ")}`);
          }
          if (typeof actionRecord.config !== "object" || actionRecord.config === null) {
            errors.push("action.config must be an object");
          }
        }
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && value !== undefined) {
      return ["Button property has no storable value"];
    }
    return null;
  }

  formatValue(): unknown {
    return null;
  }

  getDefaultValue(): unknown {
    return null;
  }

  isEmpty(): boolean {
    return true;
  }

  convertFrom(_value: unknown, _fromType: PropertyType, _fromConfig: Record<string, unknown>, _toConfig: Record<string, unknown>): unknown {
    return null;
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
