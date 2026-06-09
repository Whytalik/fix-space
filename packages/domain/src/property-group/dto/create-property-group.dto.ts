import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePropertyGroupDto {
  @ApiProperty({ description: "Database ID", example: "uuid", required: true })
  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @ApiProperty({ description: "Group name", example: "General", required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ description: "Position", example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({ description: "Visibility configuration", required: false })
  @IsOptional()
  @IsObject()
  visibility?: Record<string, unknown>;
}
