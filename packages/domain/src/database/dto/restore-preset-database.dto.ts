import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { I18nTranslations } from "../../generated/i18n.generated";
import { DATABASE_TYPES, type DatabaseType } from "./create-database.dto";

export class RestorePresetDatabaseDto {
  @ApiProperty({ enum: DATABASE_TYPES, description: "Preset database type to restore" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @IsIn(DATABASE_TYPES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  type: DatabaseType;

  @ApiProperty({ description: "Workspace ID" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  spaceId: string;

  @ApiPropertyOptional({ description: "Section ID" })
  @IsOptional()
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  sectionId?: string;
}
