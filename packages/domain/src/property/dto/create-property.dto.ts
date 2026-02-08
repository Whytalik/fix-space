import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum PropertyType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  @MinLength(1, { message: 'Property name must be at least 1 character' })
  @MaxLength(120, { message: 'Property name must not exceed 120 characters' })
  name: string;

  @IsEnum(PropertyType, { message: 'Type must be TEXT, NUMBER, or DATE' })
  @IsNotEmpty({ message: 'Property type is required' })
  type: PropertyType;

  @IsInt({ message: 'Position must be an integer' })
  @Min(0, { message: 'Position must be a non-negative integer' })
  position: number;

  @IsOptional()
  @IsBoolean({ message: 'isRequired must be a boolean' })
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean' })
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
