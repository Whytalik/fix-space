import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const FORMULA_OUTPUT_TYPE_VALUES = ["text", "number", "checkbox", "date", "relation", "array"] as const;
export type FormulaOutputType = (typeof FORMULA_OUTPUT_TYPE_VALUES)[number];

export abstract class FormulaOutputBase {
  @IsEnum(FORMULA_OUTPUT_TYPE_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: FormulaOutputType;
}

export class FormulaOutputText extends FormulaOutputBase {
  type = "text" as const;
}

export class FormulaOutputNumber extends FormulaOutputBase {
  type = "number" as const;
}

export class FormulaOutputCheckbox extends FormulaOutputBase {
  type = "checkbox" as const;
}

export class FormulaOutputDate extends FormulaOutputBase {
  type = "date" as const;
}

export class FormulaOutputRelation extends FormulaOutputBase {
  type = "relation" as const;

  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  relatedEntityId: string;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  multiple: boolean;
}

export class FormulaOutputArray extends FormulaOutputBase {
  type = "array" as const;

  @IsEnum(FORMULA_OUTPUT_TYPE_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  itemType: FormulaOutputType;
}

export type FormulaOutput =
  | FormulaOutputText
  | FormulaOutputNumber
  | FormulaOutputCheckbox
  | FormulaOutputDate
  | FormulaOutputRelation
  | FormulaOutputArray;

export class FormulaPropertyConfig {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  formula: string;

  @ValidateNested()
  @Type(() => FormulaOutputBase, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: FormulaOutputText, name: "text" },
        { value: FormulaOutputNumber, name: "number" },
        { value: FormulaOutputCheckbox, name: "checkbox" },
        { value: FormulaOutputDate, name: "date" },
        { value: FormulaOutputRelation, name: "relation" },
        { value: FormulaOutputArray, name: "array" },
      ],
    },
  })
  output: FormulaOutput;
}

export { DEFAULT_FORMULA_PROPERTY } from "./formula.constants";
