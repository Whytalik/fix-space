import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

export class DuplicateOptionsDto {
  @ApiProperty({ description: "Include sections in duplication", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeSections?: boolean = true;

  @ApiProperty({ description: "Include databases in duplication", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeDatabases?: boolean = true;

  @ApiProperty({ description: "Include properties in duplication", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeProperties?: boolean = true;

  @ApiProperty({ description: "Include templates in duplication", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeTemplates?: boolean = true;

  @ApiProperty({ description: "Include automations in duplication", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeAutomations?: boolean = true;
}
