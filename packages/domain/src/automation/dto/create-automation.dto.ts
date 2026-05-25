import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
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

export enum AutomationTrigger {
  ON_RECORD_CREATE = "ON_RECORD_CREATE",
  ON_FIELD_CHANGE = "ON_FIELD_CHANGE",
  ON_SCHEDULE = "ON_SCHEDULE",
}

export class CreateAutomationDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @IsEnum(AutomationTrigger, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  trigger: AutomationTrigger;

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

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  active?: boolean;
}
