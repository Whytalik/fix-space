import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty({
    message: "Space name is required",
  })
  @MinLength(1, {
    message: "Space name must be at least 1 character",
  })
  @MaxLength(120, {
    message: "Space name must not exceed 120 characters",
  })
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
