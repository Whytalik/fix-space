import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export { GroupField, DateGroupGranularity } from "./record-group.enums";
import { GroupField, DateGroupGranularity } from "./record-group.enums";

export class RecordGroupDto {
  @ApiProperty({ enum: GroupField, description: "Field to group by" })
  @IsEnum(GroupField, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  field: GroupField;

  @ApiProperty({ description: "Property ID when grouping by property", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @ValidateIf((item) => item.field === GroupField.PROPERTY)
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;

  @ApiProperty({ enum: DateGroupGranularity, description: "Granularity for date grouping", required: false })
  @IsOptional()
  @IsEnum(DateGroupGranularity, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  granularity?: DateGroupGranularity;
}
