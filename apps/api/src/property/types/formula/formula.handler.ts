import { Injectable } from "@nestjs/common";
import { DEFAULT_FORMULA_PROPERTY, FORMULA_OUTPUT_TYPE_VALUES, FormulaOutputType, PropertyType } from "@nucleus/domain";
import { PropertyConfigHandler, PropertyValueHandler } from "../handler.interface";

@Injectable()
export class FormulaHandler implements PropertyConfigHandler, PropertyValueHandler {
  readonly type = PropertyType.FORMULA;

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_FORMULA_PROPERTY,
      output: {
        type: "text",
      },
    };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.formula !== undefined && typeof config.formula !== "string") {
      errors.push("formula must be a string");
    }

    if (config.output !== undefined) {
      if (typeof config.output !== "object" || config.output === null) {
        errors.push("output must be an object");
      } else {
        const output = config.output as Record<string, unknown>;

        if (!FORMULA_OUTPUT_TYPE_VALUES.includes(output.type as FormulaOutputType)) {
          errors.push(`output.type must be one of: ${FORMULA_OUTPUT_TYPE_VALUES.join(", ")}`);
        }

        if (output.type === "relation") {
          if (typeof output.relatedEntityId !== "string") {
            errors.push("output.relatedEntityId must be a string for relation output");
          }
          if (typeof output.multiple !== "boolean") {
            errors.push("output.multiple must be a boolean for relation output");
          }
        }
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && value !== undefined) {
      return ["Formula property values are read-only and cannot be set directly"];
    }
    return null;
  }

  formatValue(value: unknown): unknown {
    return value ?? null;
  }

  getDefaultValue(): unknown {
    return null;
  }
}
