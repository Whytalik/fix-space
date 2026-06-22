import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { DuplicateOptionsDto } from "../../../common/dto/requests/duplicate-options.dto";

export class DuplicateSpaceDto extends DuplicateOptionsDto {
  @ApiProperty({ description: "New space name (1-120 chars)", example: "My Duplicated Journal", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  newName?: string;
}
