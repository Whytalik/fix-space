import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty({ message: 'Space name is required' })
  @MinLength(1, { message: 'Space name must be at least 1 character' })
  @MaxLength(120, { message: 'Space name must not exceed 120 characters' })
  name: string;

  @IsUUID('4', { message: 'Owner ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Owner ID is required' })
  ownerId: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
