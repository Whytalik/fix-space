import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import {
  AutomationAction,
  AutomationActionBase,
  CreateRecordAction,
  LinkRecordsAction,
  SetFieldValueAction,
} from "./automation-actions.dto";

export enum AutomationTrigger {
  ON_RECORD_CREATE = "ON_RECORD_CREATE",
  ON_FIELD_CHANGE = "ON_FIELD_CHANGE",
  ON_SCHEDULE = "ON_SCHEDULE",
}

export class CreateAutomationDto {
  @ApiProperty({ description: "Database ID", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "Automation name", example: "My Automation", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "Trigger type", enum: AutomationTrigger, example: AutomationTrigger.ON_RECORD_CREATE, required: true })
  @IsEnum(AutomationTrigger, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  trigger: AutomationTrigger;

  @ApiPropertyOptional({
    description:
      "Trigger-specific configuration. For ON_FIELD_CHANGE: { propertyId, condition? }. For ON_SCHEDULE: { interval, time, dayOfWeek?, dayOfMonth? }.",
    example: { propertyId: "clx123...", condition: { type: "equals", value: true } },
  })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config?: Record<string, unknown>;

  @ApiProperty({ description: "List of actions (max 5)", example: [], required: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => AutomationActionBase, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: SetFieldValueAction, name: "SET_FIELD_VALUE" },
        { value: CreateRecordAction, name: "CREATE_RECORD" },
        { value: LinkRecordsAction, name: "LINK_RECORDS" },
      ],
    },
  })
  actions: AutomationAction[];

  @ApiPropertyOptional({ description: "Whether automation is active", example: true })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  active?: boolean;
}
