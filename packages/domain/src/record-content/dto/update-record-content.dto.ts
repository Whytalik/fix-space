import { IsObject } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class UpdateRecordContentDto {
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  content: Record<string, unknown>;
}
