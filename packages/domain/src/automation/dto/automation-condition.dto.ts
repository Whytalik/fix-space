import { Type } from "class-transformer";
import { IsEnum, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { FilterLogic, RecordFilterDto } from "../../record/dto/record-filter.dto";

export enum ConditionType {
  GROUP = "GROUP",
  RULE = "RULE",
}

export abstract class ConditionBase {
  @IsEnum(ConditionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: ConditionType;
}

export class ConditionRule extends ConditionBase {
  type: ConditionType.RULE = ConditionType.RULE;

  @ValidateNested()
  @Type(() => RecordFilterDto)
  filter: RecordFilterDto;
}

export class ConditionGroup extends ConditionBase {
  type: ConditionType.GROUP = ConditionType.GROUP;

  @IsEnum(FilterLogic, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  logic: FilterLogic;

  @ValidateNested({ each: true })
  @Type(() => ConditionBase, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: ConditionRule, name: ConditionType.RULE },
        { value: ConditionGroup, name: ConditionType.GROUP },
      ],
    },
  })
  conditions: (ConditionRule | ConditionGroup)[];
}

export type AutomationCondition = ConditionRule | ConditionGroup;
