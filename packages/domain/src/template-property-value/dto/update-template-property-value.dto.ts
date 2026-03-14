import { IsOptional, IsString } from "class-validator";

export class UpdateTemplatePropertyValueDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  value?: unknown;
}
