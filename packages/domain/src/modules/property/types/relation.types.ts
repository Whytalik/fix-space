import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class RelationPropertyConfig {
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  relatedEntityId: string;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  multiple: boolean;

  @IsOptional()
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  reversePropertyId?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  reversePropertyName?: string;
}

export { DEFAULT_RELATION_PROPERTY } from "./relation.constants";
