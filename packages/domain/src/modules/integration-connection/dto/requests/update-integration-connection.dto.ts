import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty } from "@nestjs/swagger";

import { I18nTranslations } from "@/generated/i18n.generated";
import { IntegrationService } from "../requests/create-integration-connection.dto";
import { ExchangeCredentials, Mt5Credentials } from "../common/credentials.dto";

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

export class UpdateIntegrationConnectionDto {
  @ApiProperty({ description: "Space identifier", example: "123e4567-e89b-12d3-a456-426614174000", required: false, nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  spaceId?: string | null;

  @ApiProperty({ description: "Integration service provider", example: "BINANCE", required: false })
  @IsOptional()
  @IsEnum(IntegrationService, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  service?: IntegrationService;

  @ApiProperty({ description: "Connection display name", example: "My Binance Account", required: false, maxLength: 255 })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Authentication credentials for the service", required: false })
  @IsOptional()
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
  credentials?: ExchangeCredentials | Mt5Credentials;

  @ApiProperty({ description: "Connection status", example: "ACTIVE", required: false })
  @IsOptional()
  @IsEnum(IntegrationStatus, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  status?: IntegrationStatus;

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

  @ApiProperty({ description: "Last synchronization error message", example: "Connection refused", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  lastSyncError?: string;

  @ApiProperty({ description: "Number of consecutive failed sync attempts", example: 0, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0)
  consecutiveFailures?: number;
}
