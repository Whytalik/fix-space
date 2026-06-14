import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiPropertyOptional } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";
import {
  AutomationAction,
  AutomationActionBase,
  CreateRecordAction,
  LinkRecordsAction,
  SetFieldValueAction,
} from "../common/automation-actions.dto";
import { AutomationTrigger } from "./create-automation.dto";

export class UpdateAutomationDto {
  @ApiPropertyOptional({ description: "Automation name", example: "My Automation" })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiPropertyOptional({ description: "Trigger type", enum: AutomationTrigger, example: AutomationTrigger.ON_RECORD_CREATE })
  @IsOptional()
  @IsEnum(AutomationTrigger, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  trigger?: AutomationTrigger;

  @ApiPropertyOptional({
    description:
      "Trigger-specific configuration. For ON_FIELD_CHANGE: { propertyId, condition? }. For ON_SCHEDULE: { interval, time, dayOfWeek?, dayOfMonth? }.",
    example: { propertyId: "clx123..." },
  })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "List of actions (max 5)" })
  @IsOptional()
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
  actions?: AutomationAction[];

  @ApiPropertyOptional({ description: "Whether automation is active", example: true })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  active?: boolean;
}
