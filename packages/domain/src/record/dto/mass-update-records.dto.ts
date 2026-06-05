import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export class MassUpdateRecordsDto {
  @ApiProperty({ description: "Record IDs to update", type: [String], example: ["550e8400-e29b-41d4-a716-446655440000"] })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ArrayMinSize(1, { message: i18nValidationMessage<I18nTranslations>("validation.ARRAY_MIN_SIZE") })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  recordIds: string[];

  @ApiProperty({ description: "Property ID to update", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "New value for the property" })
  value: unknown;
}
