import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

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
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @IsOptional()
  @IsEnum(AutomationTrigger, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  trigger?: AutomationTrigger;

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

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  active?: boolean;

  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  config?: Record<string, unknown>;
}
