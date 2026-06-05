import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export { GroupField, DateGroupGranularity } from "./record-group.enums";
import { GroupField, DateGroupGranularity } from "./record-group.enums";

export class RecordGroupDto {
  @IsEnum(GroupField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field: GroupField;

  @ValidateIf((item) => item.field === GroupField.PROPERTY)
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;

  @IsOptional()
  @IsEnum(DateGroupGranularity, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  granularity?: DateGroupGranularity;
}
