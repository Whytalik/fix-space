import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";
import { PropertyType } from "../property-type.enum";

export enum FormulaType {
  PRESET = "PRESET",
  CUSTOM = "CUSTOM",
}

export enum FormulaPresetName {
  CONDITIONAL_TEXT = "CONDITIONAL_TEXT",
  DATE_DIFF = "DATE_DIFF",
  PERCENTAGE = "PERCENTAGE",
  RELATED_RECORDS = "RELATED_RECORDS",
  AVG_SCORE = "AVG_SCORE",
  CATEGORY_THRESHOLD = "CATEGORY_THRESHOLD",
  R_MULTIPLE = "R_MULTIPLE",
  PLANNED_RR = "PLANNED_RR",
  RISK_PCT_BALANCE = "RISK_PCT_BALANCE",
  RULE_COMPLIANCE = "RULE_COMPLIANCE",
}

export class FormulaPropertyConfig {
  @IsEnum(FormulaType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: FormulaType;

  @IsOptional()
  @IsEnum(FormulaPresetName, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  presetName?: FormulaPresetName;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  expression: string;

  @IsEnum(PropertyType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  resultType: PropertyType;

  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  uiState?: Record<string, unknown>;
}

export { DEFAULT_FORMULA_PROPERTY } from "./formula.constants";
