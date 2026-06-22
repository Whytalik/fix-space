import { Logger } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

export type I18nPath = string;

const logger = new Logger("i18n");

export function t(key: I18nPath, args?: Record<string, unknown>): string {
  const i18n = I18nContext.current();
  if (!i18n) {
    logger.warn(`No I18nContext for key "${key}" — returning raw key. Called outside HTTP request scope.`);
    return key;
  }
  return i18n.t(key, { args });
}
