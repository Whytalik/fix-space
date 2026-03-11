import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { PropertyType } from "./create-property.dto";

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  databaseId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Property name must be at least 1 character" })
  @MaxLength(120, { message: "Property name must not exceed 120 characters" })
  name?: string;

  @IsOptional()
  @IsEnum(PropertyType, { message: "Type must be TEXT, NUMBER, or DATE" })
  type?: PropertyType;

  @IsOptional()
  @IsInt({ message: "Position must be an integer" })
  @Min(0, { message: "Position must be a non-negative integer" })
  position?: number;

  @IsOptional()
  @IsBoolean({ message: "isRequired must be a boolean" })
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean({ message: "isPrimary must be a boolean" })
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  config?: Record<string, unknown>;
}
