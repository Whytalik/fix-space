import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePropertyGroupDto {
  @ApiProperty({ description: "Group name", example: "General", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ description: "Position", example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({ description: "Visibility configuration", required: false })
  @IsOptional()
  visibility?: Record<string, unknown> | null;
}
