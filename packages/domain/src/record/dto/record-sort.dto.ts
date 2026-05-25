import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum SortField {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  PROPERTY = "property",
}

export class RecordSortDto {
  @IsEnum(SortField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field: SortField;

  @IsEnum(SortDirection, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  direction: SortDirection;

  @ValidateIf((o) => o.field === SortField.PROPERTY)
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;
}
