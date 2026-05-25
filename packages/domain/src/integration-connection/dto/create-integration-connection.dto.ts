import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

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
  @IsEnum(IntegrationService, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  service: IntegrationService;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

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

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  syncInterval?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  marketType?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  externalAccountId?: string;
}
