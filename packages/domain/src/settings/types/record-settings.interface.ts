import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export class RecordSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultRecordIcon: string;
}

export const DEFAULT_RECORD_SETTINGS: RecordSettings = {
  defaultRecordIcon: "icon:FileText",
};
