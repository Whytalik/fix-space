import { IsBoolean } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class CheckboxPropertyConfig {
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  defaultValue: boolean;
}

export { DEFAULT_CHECKBOX_PROPERTY } from "./checkbox.constants";
