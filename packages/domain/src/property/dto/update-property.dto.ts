import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import {
  ButtonProperty,
  CheckboxProperty,
  DateProperty,
  DurationProperty,
  FormulaProperty,
  NumberProperty,
  ProgressProperty,
  RatingProperty,
  RelationProperty,
  SelectProperty,
  StatusProperty,
  TextProperty,
} from "../types";
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
        { value: TextProperty, name: PropertyType.TEXT },
        { value: NumberProperty, name: PropertyType.NUMBER },
        { value: DateProperty, name: PropertyType.DATE },
        { value: CheckboxProperty, name: PropertyType.CHECKBOX },
        { value: DurationProperty, name: PropertyType.DURATION },
        { value: SelectProperty, name: PropertyType.SELECT },
        { value: StatusProperty, name: PropertyType.STATUS },
        { value: RelationProperty, name: PropertyType.RELATION },
        { value: FormulaProperty, name: PropertyType.FORMULA },
        { value: RatingProperty, name: PropertyType.RATING },
        { value: ProgressProperty, name: PropertyType.PROGRESS },
        { value: ButtonProperty, name: PropertyType.BUTTON },
      ],
    },
  })
  config?:
    | TextProperty
    | NumberProperty
    | DateProperty
    | CheckboxProperty
    | DurationProperty
    | SelectProperty
    | StatusProperty
    | RelationProperty
    | FormulaProperty
    | RatingProperty
    | ProgressProperty
    | ButtonProperty;
}
