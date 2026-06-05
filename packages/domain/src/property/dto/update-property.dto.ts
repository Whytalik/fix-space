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
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  databaseId?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @MinLength(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN_LENGTH") })
  @MaxLength(120, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name?: string;

  @IsOptional()
  @IsEnum(PropertyType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type?: PropertyType;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  position?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isVisible?: boolean;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  hint?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  group?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  groupId?: string;

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
