import { Type } from "class-transformer";
import { IsEnum, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import { FilterLogic, RecordFilterDto } from "../../record/dto/record-filter.dto";

export enum ConditionType {
  GROUP = "GROUP",
  RULE = "RULE",
}

export abstract class ConditionBase {
  @ApiProperty({ description: "Condition type", enum: ConditionType, example: ConditionType.RULE, required: true })
  @IsEnum(ConditionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: ConditionType;
}

export class ConditionRule extends ConditionBase {
  @ApiProperty({ description: "Condition type", enum: ConditionType, example: ConditionType.RULE, required: true })
  type: ConditionType.RULE = ConditionType.RULE;

  @ApiProperty({ description: "Record filter", required: true })
  @ValidateNested()
  @Type(() => RecordFilterDto)
  filter: RecordFilterDto;
}

export class ConditionGroup extends ConditionBase {
  @ApiProperty({ description: "Condition type", enum: ConditionType, example: ConditionType.GROUP, required: true })
  type: ConditionType.GROUP = ConditionType.GROUP;

  @ApiProperty({ description: "Filter logic", enum: FilterLogic, example: FilterLogic.AND, required: true })
  @IsEnum(FilterLogic, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  logic: FilterLogic;

  @ApiProperty({ description: "Nested conditions", required: true })
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
