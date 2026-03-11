import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdatePropertyValueDto {
  @IsOptional()
  @IsString()
  recordId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  value?: unknown;

  @IsOptional()
  @IsBoolean({ message: "computed must be a boolean" })
  computed?: boolean;
}
