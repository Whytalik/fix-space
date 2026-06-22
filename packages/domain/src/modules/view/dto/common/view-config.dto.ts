import { IsBoolean, IsObject, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";

export class ViewConfigDto {
  @ApiProperty({ description: "Wrap text", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  wrapText?: boolean;

  @ApiProperty({ description: "Use relative dates", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  relativeDates?: boolean;

  @ApiProperty({ description: "Pin first column", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  pinFirstColumn?: boolean;

  @ApiProperty({ description: "Column widths", example: { col1: 200 }, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  columnWidths?: Record<string, number>;
}
