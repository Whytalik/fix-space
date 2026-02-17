import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  key: string;

  @IsObject({ message: 'Value must be an object' })
  @IsNotEmpty({ message: 'Value is required' })
  value: Record<string, unknown>;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;
}
