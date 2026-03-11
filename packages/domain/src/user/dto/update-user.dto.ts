import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters" })
  @MaxLength(50, { message: "Username must not exceed 50 characters" })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores and hyphens" })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  password?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
