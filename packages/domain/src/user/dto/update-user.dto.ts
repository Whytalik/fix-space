import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RegisterUserDto } from 'entry';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
