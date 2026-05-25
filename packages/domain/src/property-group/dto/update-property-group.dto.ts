import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdatePropertyGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  visibility?: Record<string, unknown> | null;
}
