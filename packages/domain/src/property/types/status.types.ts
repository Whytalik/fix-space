import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export const STATUS_CATEGORY_VALUES = ["todo", "in_progress", "complete"] as const;
export type StatusCategory = (typeof STATUS_CATEGORY_VALUES)[number];

export const STATUS_OPTION_COLOR_VALUES = [
  "#6B7280",
  "#92400E",
  "#D97706",
  "#CA8A04",
  "#16A34A",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
] as const;
export type StatusOptionColor = (typeof STATUS_OPTION_COLOR_VALUES)[number];

export class StatusOption {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  name: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  color: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;
}

export class StatusCategoryConfig {
  @IsEnum(STATUS_CATEGORY_VALUES, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  category: StatusCategory;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  defaultOption: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => StatusOption)
  options: StatusOption[];
}

export class StatusProperty {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  defaultOption: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => StatusCategoryConfig)
  categories: StatusCategoryConfig[];
}

export const DEFAULT_STATUS_PROPERTY: StatusProperty = {
  defaultOption: "Not started",
  categories: [
    {
      category: "todo",
      defaultOption: "Not started",
      options: [
        {
          name: "Not started",
          color: "#6B7280",
        },
        {
          name: "Blocked",
          color: "#DC2626",
        },
      ],
    },
    {
      category: "in_progress",
      defaultOption: "In progress",
      options: [
        {
          name: "In review",
          color: "#D97706",
        },
        {
          name: "In progress",
          color: "#2563EB",
        },
      ],
    },
    {
      category: "complete",
      defaultOption: "Done",
      options: [
        {
          name: "Done",
          color: "#16A34A",
        },
        {
          name: "Cancelled",
          color: "#92400E",
        },
      ],
    },
  ],
};
