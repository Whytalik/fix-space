import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { CreatePropertyDto } from "../../property/dto/create-property.dto";
import { DatabaseConfigDto } from "./database-config.dto";

export type DatabaseType =
  | "trading-journal"
  | "daily-routine"
  | "routine-library"
  | "notes"
  | "mistakes"
  | "accounts"
  | "operations"
  | "trading-system"
  | "performance-review"
  | "custom";

export const DATABASE_TYPES: DatabaseType[] = [
  "trading-journal",
  "daily-routine",
  "routine-library",
  "notes",
  "mistakes",
  "accounts",
  "operations",
  "trading-system",
  "performance-review",
  "custom",
];

export class CreateDatabaseDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  spaceId: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  title: string;

  @IsOptional()
  @IsIn(DATABASE_TYPES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_IN") })
  type?: DatabaseType;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  key?: string;

  @IsOptional()
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  sectionId?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  sectionKey?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  @Max(100, { message: i18nValidationMessage<I18nTranslations>("validation.MAX") })
  recordLimit?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isPreset?: boolean;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isLocked?: boolean;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  useDefaultTemplate?: boolean;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  enableStats?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseConfigDto)
  config?: DatabaseConfigDto;

  @IsOptional()
  properties?: CreatePropertyDto[];
}
