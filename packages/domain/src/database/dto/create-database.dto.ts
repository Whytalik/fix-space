import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export type DatabaseType = "trading-journal" | "daily-routine" | "notes" | "mistakes" | "accounts" | "trading-system" | "custom";

export const DATABASE_TYPES: DatabaseType[] = ["trading-journal", "daily-routine", "notes", "mistakes", "accounts", "trading-system", "custom"];

export class CreateDatabaseDto {
  @IsString()
  @IsNotEmpty({
    message: "Database name is required",
  })
  @MinLength(1, {
    message: "Database name must be at least 1 character",
  })
  @MaxLength(120, {
    message: "Database name must not exceed 120 characters",
  })
  name: string;

  @IsString()
  @IsNotEmpty({
    message: "Database title is required",
  })
  @MinLength(1, {
    message: "Database title must be at least 1 character",
  })
  @MaxLength(255, {
    message: "Database title must not exceed 255 characters",
  })
  title: string;

  @IsOptional()
  @IsIn(DATABASE_TYPES, {
    message: "Invalid database type",
  })
  type?: DatabaseType;

  @IsOptional()
  @IsUUID("4", {
    message: "Section ID must be a valid UUID",
  })
  sectionId?: string;

  @IsOptional()
  @IsString()
  sectionKey?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  properties?: Record<string, any>;
}
