import { BadRequestException } from "@nestjs/common";

import { t } from "./i18n.helper";

export function parseJson<T>(raw: string, paramName: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new BadRequestException(t("errors.INVALID_JSON_PARAM", { paramName }));
  }
}
