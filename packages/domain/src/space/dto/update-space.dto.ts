import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { SectionOperationDto } from "../../section/dto/section-operation.dto";
import { SpaceConfigDto } from "./space-config.dto";

export class UpdateSpaceDto {
  @ApiProperty({ description: "Space name (1-120 chars)", example: "My Updated Journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Space icon identifier", example: "chart", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Whether this is the default space", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isDefault?: boolean;

  @ApiProperty({ description: "Space configuration", required: false, type: () => SpaceConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpaceConfigDto)
  config?: SpaceConfigDto;

  @ApiProperty({ description: "Section operations", required: false, type: () => SectionOperationDto, isArray: true })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => SectionOperationDto)
  sectionOperations?: SectionOperationDto[];
}
