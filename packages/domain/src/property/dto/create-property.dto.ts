import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { PropertyType } from "../property-type.enum";
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
} from "../types";

export { PropertyType } from "../property-type.enum";

export type PropertyConfig =
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

export class CreatePropertyDto {
  @ApiProperty({ description: "Database ID" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "Property name (1-120 chars)", example: "Status" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ enum: PropertyType, description: "Property type", example: "text" })
  @IsEnum(PropertyType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  type: PropertyType;

  @ApiProperty({ description: "Property position (ordering)", example: 0 })
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  position: number;

  @ApiProperty({ description: "Whether the property is required", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isRequired?: boolean;

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

  @ApiProperty({ description: "Property group name", example: "General", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  group?: string;

  @ApiProperty({ description: "Property group ID", example: "group_1", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  groupId?: string;

  @ApiProperty({ description: "Property type-specific configuration", required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: TextPropertyConfig, name: PropertyType.TEXT },
        { value: NumberPropertyConfig, name: PropertyType.NUMBER },
        { value: DatePropertyConfig, name: PropertyType.DATE },
        { value: CheckboxPropertyConfig, name: PropertyType.CHECKBOX },
        { value: DurationPropertyConfig, name: PropertyType.DURATION },
        { value: SelectPropertyConfig, name: PropertyType.SELECT },
        { value: StatusPropertyConfig, name: PropertyType.STATUS },
        { value: RelationPropertyConfig, name: PropertyType.RELATION },
        { value: FormulaPropertyConfig, name: PropertyType.FORMULA },
        { value: RatingPropertyConfig, name: PropertyType.RATING },
        { value: ProgressPropertyConfig, name: PropertyType.PROGRESS },
      ],
    },
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
