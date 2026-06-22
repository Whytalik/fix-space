import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export class UpdatePropertyValueDto {
  @ApiProperty({ description: "Record ID", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  recordId?: string;

  @ApiProperty({ description: "Property ID", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  propertyId?: string;

  @ApiProperty({ description: "Property value", required: false })
  @IsOptional()
  value?: unknown;

  @ApiProperty({ description: "Whether the value is computed", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  computed?: boolean;
}
