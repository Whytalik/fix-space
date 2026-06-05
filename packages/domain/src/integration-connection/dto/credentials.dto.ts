import { IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";

export class ExchangeCredentials {
  @ApiProperty({ description: "API key for authentication", example: "abc123def456", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  apiKey: string;

  @ApiProperty({ description: "API secret for authentication", example: "secret123", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  apiSecret: string;
}

export class OkxCredentials extends ExchangeCredentials {
  @ApiProperty({ description: "OKX API passphrase", example: "mypassphrase", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  passphrase: string;
}

export class Mt5Credentials {
  @ApiProperty({ description: "MT5 account login", example: "12345678", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  login: string;

  @ApiProperty({ description: "MT5 account password", example: "password123", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  password: string;

  @ApiProperty({ description: "MT5 server name", example: "ICMarkets-Demo", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  server: string;
}

export class CTraderCredentials {
  @ApiProperty({ description: "cTrader access token", example: "access_token_abc", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  accessToken: string;

  @ApiProperty({ description: "cTrader refresh token", example: "refresh_token_xyz", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  refreshToken: string;
}
