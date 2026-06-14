import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";
import { VisibilityConditionDto } from "../common/visibility-condition.dto";
import {
  CheckboxPropertyConfig,
  DatePropertyConfig,
  DurationPropertyConfig,
  FormulaPropertyConfig,
  NumberPropertyConfig,
  ProgressPropertyConfig,
  RatingPropertyConfig,
  RelationPropertyConfig,
  SelectPropertyConfig,
  StatusPropertyConfig,
  TextPropertyConfig,
} from "../../types";
import { PropertyType } from "./create-property.dto";

export class UpdatePropertyDto {
  @ApiProperty({ description: "Database ID", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  databaseId?: string;

  @ApiProperty({ description: "Property name (1-120 chars)", example: "Status", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @ApiProperty({ enum: PropertyType, description: "Property type", example: "text", required: false })
  @IsOptional()
  @IsEnum(PropertyType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type?: PropertyType;

  @ApiProperty({ description: "Property position (ordering)", example: 0, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  position?: number;

  @ApiProperty({ description: "Whether the property is visible", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isVisible?: boolean;

  @ApiProperty({ description: "Property icon identifier", example: "tag", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Hint text for the property", example: "Select a status", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  hint?: string;

  @ApiProperty({ description: "Key for integration mapping", example: "pair", required: false, nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  integrationKey?: string | null;

  @ApiProperty({
    description: "Visibility condition based on another property value",
    required: false,
    nullable: true,
    type: () => VisibilityConditionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VisibilityConditionDto)
  visibilityCondition?: VisibilityConditionDto | null;

  @ApiProperty({ description: "Property group ID", example: "group_1", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  groupId?: string;

  @ApiProperty({ description: "Property type-specific configuration", required: false })
  @IsOptional()
  @ValidateNested()
  @Type((options) => {
    const parentType = options?.object?.type;
    const configType =
      options?.object?.config && typeof options.object.config === "object" && "type" in options.object.config
        ? (options.object.config as Record<string, unknown>).type
        : undefined;
    const typeVal = parentType ?? (configType !== "CUSTOM" && configType !== "PRESET" ? undefined : configType);

    switch (typeVal ?? parentType) {
      case PropertyType.TEXT:
        return TextPropertyConfig;
      case PropertyType.NUMBER:
        return NumberPropertyConfig;
      case PropertyType.DATE:
        return DatePropertyConfig;
      case PropertyType.CHECKBOX:
        return CheckboxPropertyConfig;
      case PropertyType.DURATION:
        return DurationPropertyConfig;
      case PropertyType.SELECT:
        return SelectPropertyConfig;
      case PropertyType.STATUS:
        return StatusPropertyConfig;
      case PropertyType.RELATION:
        return RelationPropertyConfig;
      case PropertyType.RATING:
        return RatingPropertyConfig;
      case PropertyType.PROGRESS:
        return ProgressPropertyConfig;
      case PropertyType.FORMULA:
      case "CUSTOM":
      case "PRESET":
        return FormulaPropertyConfig;
      default:
        if (parentType === PropertyType.FORMULA) {
          return FormulaPropertyConfig;
        }
        return Object;
    }
  })
  config?:
    | TextPropertyConfig
    | NumberPropertyConfig
    | DatePropertyConfig
    | CheckboxPropertyConfig
    | DurationPropertyConfig
    | SelectPropertyConfig
    | StatusPropertyConfig
    | RelationPropertyConfig
    | FormulaPropertyConfig
    | RatingPropertyConfig
    | ProgressPropertyConfig;
}
