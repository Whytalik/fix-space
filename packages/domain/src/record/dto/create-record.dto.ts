import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRecordDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Record name must not exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
