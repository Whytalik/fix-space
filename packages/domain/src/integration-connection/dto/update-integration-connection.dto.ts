import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { IntegrationService } from "./create-integration-connection.dto";
import { CTraderCredentials, ExchangeCredentials, Mt5Credentials, OkxCredentials } from "./credentials.dto";

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

export class UpdateIntegrationConnectionDto {
  @IsOptional()
  @IsEnum(IntegrationService, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  service?: IntegrationService;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @IsOptional()
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
  credentials?: ExchangeCredentials | OkxCredentials | Mt5Credentials | CTraderCredentials;

  @IsOptional()
  @IsEnum(IntegrationStatus, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  status?: IntegrationStatus;

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

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  lastSyncError?: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0)
  consecutiveFailures?: number;
}
