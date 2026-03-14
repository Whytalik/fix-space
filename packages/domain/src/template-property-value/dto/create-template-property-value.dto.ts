import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTemplatePropertyValueDto {
  @IsString()
  @IsNotEmpty({ message: "Template ID is required" })
  templateId: string;

  @IsString()
  @IsNotEmpty({ message: "Property ID is required" })
  propertyId: string;

  @IsOptional()
  value?: unknown;
}
