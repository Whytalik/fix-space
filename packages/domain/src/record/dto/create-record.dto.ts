import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty({
    message: "Database ID is required",
  })
  databaseId: string;


  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: "Record name must not exceed 255 characters",
  })
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
