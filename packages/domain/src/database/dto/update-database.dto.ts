import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { CreatePropertyDto } from "../../property/dto/create-property.dto";
import { DATABASE_TYPES, DatabaseType } from "./create-database.dto";

export class UpdateDatabaseDto {
  @IsOptional()
  @IsString()
  spaceId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Database name must be at least 1 character" })
  @MaxLength(120, { message: "Database name must not exceed 120 characters" })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Database title must be at least 1 character" })
  @MaxLength(255, { message: "Database title must not exceed 255 characters" })
  title?: string;

  @IsOptional()
  @IsIn(DATABASE_TYPES, { message: "Invalid database type" })
  type?: DatabaseType;

  @IsOptional()
  @IsUUID("4", { message: "Section ID must be a valid UUID" })
  sectionId?: string;

  @IsOptional()
  @IsString()
  sectionKey?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  properties?: CreatePropertyDto[];
}
