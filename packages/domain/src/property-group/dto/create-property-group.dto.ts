import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreatePropertyGroupDto {
  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsObject()
  visibility?: Record<string, unknown>;
}
