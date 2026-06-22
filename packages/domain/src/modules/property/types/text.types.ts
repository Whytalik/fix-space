import { IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export { DEFAULT_TEXT_PROPERTY } from "./text.constants";

export class TextPropertyConfig {
  @IsOptional()
  @ValidateIf((o) => o.defaultValue !== undefined && o.defaultValue !== null)
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultValue?: string | null;
}
