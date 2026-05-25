import { Exclude, Expose, Type } from "class-transformer";
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

@Exclude()
export class PropertyResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  type: PropertyType;

  @Expose()
  position: number;

  @Expose()
  icon: string | null;

  @Expose()
  hint: string | null;

  @Expose()
  group: string | null;

  @Expose()
  groupId: string | null;

  @Expose()
  isRequired: boolean;

  @Expose()
  isVisible: boolean;

  @Expose()
  isProtected: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
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

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
}
