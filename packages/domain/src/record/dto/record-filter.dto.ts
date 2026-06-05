import { IsArray, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { FilterField, FilterOperator } from "./record-filter.enums";

export { FilterField, FilterLogic, FilterOperator } from "./record-filter.enums";

export class RecordFilterDto {
  @IsOptional()
  @IsEnum(FilterField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field?: FilterField;

  @ValidateIf((item: RecordFilterDto) => !item.field || item.field === FilterField.PROPERTY)
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId: string;

  @IsEnum(FilterOperator, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operator: FilterOperator;

  @IsOptional()
  value?: string | number | boolean | null;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  values?: string[];
}
