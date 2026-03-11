import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateRecordDto {
  @IsOptional()
  @IsString()
  databaseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Record name must not exceed 255 characters" })
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
