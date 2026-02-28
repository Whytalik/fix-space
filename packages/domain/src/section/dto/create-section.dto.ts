import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty({ message: 'Section name is required' })
  @MinLength(1, { message: 'Section name must be at least 1 character' })
  @MaxLength(120, { message: 'Section name must not exceed 120 characters' })
  name: string;

  @IsOptional()
  @IsInt({ message: 'Position must be an integer' })
  @Min(0, { message: 'Position must be a non-negative integer' })
  position?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
