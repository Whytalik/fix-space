import { IsArray, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";
import { FilterField, FilterOperator } from "./record-filter.enums";

export { FilterField, FilterLogic, FilterOperator } from "./record-filter.enums";

export class RecordFilterDto {
  @ApiProperty({ enum: FilterField, description: "Field to filter by", required: false })
  @IsOptional()
  @IsEnum(FilterField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field?: FilterField;

  @ApiProperty({ description: "Property ID when filtering by property", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ValidateIf((item: RecordFilterDto) => !item.field || item.field === FilterField.PROPERTY)
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId: string;

  @ApiProperty({ enum: FilterOperator, description: "Filter operator" })
  @IsEnum(FilterOperator, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operator: FilterOperator;

  @ApiProperty({ description: "Filter value", required: false })
  @IsOptional()
  value?: string | number | boolean | null;

  @ApiProperty({ description: "Filter values for IN/NOT_IN operators", type: [String], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  values?: string[];
}
