import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import {
  AutomationAction,
  AutomationActionBase,
  CreateRecordAction,
  LinkRecordsAction,
  SetFieldValueAction,
} from "./automation-actions.dto";
import { AutomationCondition, ConditionBase, ConditionGroup, ConditionRule } from "./automation-condition.dto";
import { AutomationTrigger } from "./create-automation.dto";

export class UpdateAutomationDto {
  @ApiProperty({ description: "Automation name", example: "My Automation", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ description: "Trigger type", enum: AutomationTrigger, example: AutomationTrigger.ON_RECORD_CREATE, required: false })
  @IsOptional()
  @IsEnum(AutomationTrigger, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  trigger?: AutomationTrigger;

  @ApiProperty({ description: "Condition for automation", required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionBase, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: ConditionRule, name: "RULE" },
        { value: ConditionGroup, name: "GROUP" },
      ],
    },
  })
  condition?: AutomationCondition;

  @ApiProperty({ description: "List of actions", required: false })
  @IsOptional()
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

  @ApiProperty({ description: "Whether automation is active", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  active?: boolean;

  @ApiProperty({ description: "Additional configuration", example: {}, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config?: Record<string, unknown>;
}
