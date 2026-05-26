import { Injectable } from "@nestjs/common";
import { DEFAULT_TEXT_PROPERTY, PropertyType, TextProperty, URL_HANDLING_VALUES, UrlHandling } from "@fixspace/domain";
import { PropertyConfigHandler, PropertyValueHandler } from "../handler.interface";

@Injectable()
export class TextHandler implements PropertyConfigHandler, PropertyValueHandler {
  readonly type = PropertyType.TEXT;

  private parseConfig(config: Record<string, unknown>): TextProperty {
    return config as unknown as TextProperty;
  }

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_TEXT_PROPERTY,
    };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && typeof config.defaultValue !== "string") {
      errors.push("defaultValue must be a string");
    }

    if (config.isRichText !== undefined && typeof config.isRichText !== "boolean") {
      errors.push("isRichText must be a boolean");
    }

    if (config.urlHandling !== undefined && !URL_HANDLING_VALUES.includes(config.urlHandling as UrlHandling)) {
      errors.push(`urlHandling must be one of: ${URL_HANDLING_VALUES.join(", ")}`);
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && typeof value !== "string") {
      return ["Text value must be a string or null"];
    }
    return null;
  }

  formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? "";
  }
}
