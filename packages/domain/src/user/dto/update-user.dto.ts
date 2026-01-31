import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsOptional } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsOptional()
  @IsObject()
  settingsConfig?: Record<string, unknown>;
}
