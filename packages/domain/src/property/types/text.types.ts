import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export { DEFAULT_TEXT_PROPERTY } from "./text.constants";

export class TextPropertyConfig {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultValue: string;
}
