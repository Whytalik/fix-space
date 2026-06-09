import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform, TransformationType, TransformFnParams } from "class-transformer";
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
  @Transform((params: TransformFnParams) => {
    const { value, type } = params;
    if (type === TransformationType.CLASS_TO_PLAIN) return value;
    if (!value) return value;
    const subTypeMap: Record<string, new (...args: unknown[]) => unknown> = {
      [PropertyType.TEXT]: TextPropertyConfig,
      [PropertyType.NUMBER]: NumberPropertyConfig,
      [PropertyType.DATE]: DatePropertyConfig,
      [PropertyType.CHECKBOX]: CheckboxPropertyConfig,
      [PropertyType.DURATION]: DurationPropertyConfig,
      [PropertyType.SELECT]: SelectPropertyConfig,
      [PropertyType.STATUS]: StatusPropertyConfig,
      [PropertyType.RELATION]: RelationPropertyConfig,
      [PropertyType.FORMULA]: FormulaPropertyConfig,
      [PropertyType.RATING]: RatingPropertyConfig,
      [PropertyType.PROGRESS]: ProgressPropertyConfig,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentObj = (params as any).obj ?? (params as any).object;
    const Ctor = subTypeMap[parentObj?.type as string];
    return Ctor ? Object.assign(new Ctor() as object, value) : value;
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

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
}
