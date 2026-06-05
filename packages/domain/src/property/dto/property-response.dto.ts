import { ApiProperty } from "@nestjs/swagger";
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
  @ApiProperty({ description: "Property ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID" })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Property name", example: "Status" })
  @Expose()
  name: string;

  @ApiProperty({ enum: PropertyType, description: "Property type", example: "text" })
  @Expose()
  type: PropertyType;

  @ApiProperty({ description: "Property position (ordering)", example: 0 })
  @Expose()
  position: number;

  @ApiProperty({ description: "Property icon", example: "tag" })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Hint text for the property", example: "Select a status" })
  @Expose()
  hint: string | null;

  @ApiProperty({ description: "Property group name", example: "General" })
  @Expose()
  group: string | null;

  @ApiProperty({ description: "Property group ID", example: "group_1" })
  @Expose()
  groupId: string | null;

  @ApiProperty({ description: "Whether the property is required", example: false })
  @Expose()
  isRequired: boolean;

  @ApiProperty({ description: "Whether the property is visible", example: true })
  @Expose()
  isVisible: boolean;

  @ApiProperty({ description: "Whether the property is protected", example: false })
  @Expose()
  isProtected: boolean;

  @ApiProperty({ description: "Visibility condition", required: false, type: () => VisibilityConditionDto })
  @Expose()
  visibilityCondition?: VisibilityConditionDto | null;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-10T00:00:00.000Z" })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Property type-specific configuration", required: false })
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
