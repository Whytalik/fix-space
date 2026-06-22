import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { DuplicateOptionsDto } from "../../../common/dto/requests/duplicate-options.dto";

export class DuplicateDatabaseDto extends DuplicateOptionsDto {
  @ApiProperty({ description: "New database name (1-120 chars)", example: "My Duplicated Database", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  newName?: string;

  @ApiProperty({ description: "Include records in duplication", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  includeRecords?: boolean = false;
}
