import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "../../generated/i18n.generated";
import { CTraderCredentials, ExchangeCredentials, Mt5Credentials, OkxCredentials } from "./credentials.dto";

export enum IntegrationService {
  BINANCE = "BINANCE",
  BYBIT = "BYBIT",
  OKX = "OKX",
  METATRADER5 = "METATRADER5",
  CTRADER = "CTRADER",
}

export class CreateIntegrationConnectionDto {
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
        { value: ExchangeCredentials, name: IntegrationService.BYBIT },
        { value: OkxCredentials, name: IntegrationService.OKX },
        { value: Mt5Credentials, name: IntegrationService.METATRADER5 },
        { value: CTraderCredentials, name: IntegrationService.CTRADER },
      ],
    },
  })
  credentials: ExchangeCredentials | OkxCredentials | Mt5Credentials | CTraderCredentials;

  @ApiProperty({ description: "Synchronization interval in minutes", example: 60, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  syncInterval?: number;

  @ApiProperty({ description: "Market type (e.g. spot, futures)", example: "spot", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  marketType?: string;

  @ApiProperty({ description: "External platform account identifier", example: "123456", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  externalAccountId?: string;
}
