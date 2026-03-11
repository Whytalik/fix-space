import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePropertyValueDto {
  @IsString()
  @IsNotEmpty({
    message: "Record ID is required",
  })
  recordId: string;

  @IsString()
  @IsNotEmpty({
    message: "Property ID is required",
  })
  propertyId: string;

  @IsOptional()
  value?: unknown;

  @IsOptional()
  @IsBoolean({
    message: "computed must be a boolean",
  })
  computed?: boolean;
}
