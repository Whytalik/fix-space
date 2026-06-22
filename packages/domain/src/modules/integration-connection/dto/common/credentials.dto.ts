import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { I18nTranslations } from "@/generated/i18n.generated";

export class ExchangeCredentials {
  @ApiPropertyOptional({ description: "Service type for discrimination", required: false })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty({ description: "API key for authentication", example: "abc123def456", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  apiKey: string;

  @ApiProperty({ description: "API secret for authentication", example: "secret123", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  apiSecret: string;
}

export class Mt5Credentials {
  @ApiPropertyOptional({ description: "Service type for discrimination", required: false })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ description: "MT5 account login", example: "12345678" })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  login?: string;

  @ApiPropertyOptional({ description: "MT5 account password", example: "password123" })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  password?: string;

  @ApiPropertyOptional({ description: "MT5 server name", example: "ICMarkets-Demo" })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  server?: string;

  @ApiPropertyOptional({ description: "API token for webhook auth", example: "sk_..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  apiToken?: string;
}
