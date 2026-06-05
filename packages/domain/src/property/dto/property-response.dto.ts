import { Exclude, Expose, Transform, TransformationType } from "class-transformer";
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
import { VisibilityConditionDto } from "./visibility-condition.dto";

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
  visibilityCondition?: VisibilityConditionDto | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform((params: any) => {
    const { value, type, object, obj } = params;
    if (type === TransformationType.CLASS_TO_PLAIN) return value;
    if (!value) return value;
    const subTypeMap: Record<string, new (...args: unknown[]) => unknown> = {
      [PropertyType.TEXT]: TextProperty,
      [PropertyType.NUMBER]: NumberProperty,
      [PropertyType.DATE]: DateProperty,
      [PropertyType.CHECKBOX]: CheckboxProperty,
      [PropertyType.DURATION]: DurationProperty,
      [PropertyType.SELECT]: SelectProperty,
      [PropertyType.STATUS]: StatusProperty,
      [PropertyType.RELATION]: RelationProperty,
      [PropertyType.FORMULA]: FormulaProperty,
      [PropertyType.RATING]: RatingProperty,
      [PropertyType.PROGRESS]: ProgressProperty,
      [PropertyType.BUTTON]: ButtonProperty,
    };
    const targetObj = obj || object;
    const Ctor = subTypeMap[targetObj?.type as string];
    return Ctor ? Object.assign(new Ctor() as object, value) : value;
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
