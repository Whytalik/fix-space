import { IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class DatabaseSettings {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultDatabaseIcon: string;
}

export const DEFAULT_DATABASE_SETTINGS: DatabaseSettings = {
  defaultDatabaseIcon: "icon:Database",
};
