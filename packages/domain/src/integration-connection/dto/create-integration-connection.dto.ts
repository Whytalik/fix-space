import { Type } from "class-transformer";
import { IsISO8601, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";
import { ExchangeCredentials, Mt5Credentials } from "./credentials.dto";

export enum IntegrationService {
  BINANCE = "BINANCE",
  METATRADER5 = "METATRADER5",
}

export class CreateIntegrationConnectionDto {
  @ApiProperty({ description: "Space identifier", example: "123e4567-e89b-12d3-a456-426614174000", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  spaceId: string;

  @ApiProperty({ description: "Integration service provider", example: "BINANCE", required: true })
  @IsEnum(IntegrationService, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  service: IntegrationService;

  @ApiProperty({ description: "Connection display name", example: "My Binance Account", required: true, maxLength: 255 })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "Authentication credentials for the service", required: true })
  @ValidateNested()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "service",
      subTypes: [
        { value: ExchangeCredentials, name: IntegrationService.BINANCE },
        { value: Mt5Credentials, name: IntegrationService.METATRADER5 },
      ],
    },
  })
  credentials: ExchangeCredentials | Mt5Credentials;

  @ApiProperty({ description: "Synchronization interval in minutes", example: 60, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  syncInterval?: number;

  @ApiProperty({ description: "Market type (e.g. spot, futures)", example: "futures", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  marketType?: string;

  @ApiPropertyOptional({ description: "Start date for initial sync range", example: "2025-01-01" })
  @IsOptional()
  @IsISO8601({ strict: true })
  syncStartDate?: string;

  @ApiProperty({ description: "External platform account identifier", example: "123456", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  externalAccountId?: string;
}
