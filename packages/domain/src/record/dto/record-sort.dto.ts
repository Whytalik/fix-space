import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export { SortDirection, SortField } from "./record-sort.enums";
import { SortDirection, SortField } from "./record-sort.enums";

export class RecordSortDto {
  @ApiProperty({ enum: SortField, description: "Field to sort by" })
  @IsEnum(SortField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field: SortField;

  @ApiProperty({ enum: SortDirection, description: "Sort direction" })
  @IsEnum(SortDirection, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  direction: SortDirection;

  @ApiProperty({ description: "Property ID when sorting by property", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @ValidateIf((item) => item.field === SortField.PROPERTY)
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;
}
