import { I18nContext } from "nestjs-i18n";

export type I18nPath = string;

export function t(key: I18nPath, args?: Record<string, unknown>): string {
  const i18n = I18nContext.current();
  if (!i18n) return key;
  return i18n.t(key, { args });
}
