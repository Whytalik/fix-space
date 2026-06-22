import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsISO8601, IsOptional, IsString } from "class-validator";

export class ImportTradesDto {
  @ApiProperty({ type: [String], description: "Position IDs to import" })
  @IsArray()
  @IsString({ each: true })
  sourcePositionIds: string[];

  @ApiProperty({ description: "Start date (ISO 8601)", example: "2024-01-01T00:00:00.000Z" })
  @IsISO8601({ strict: true })
  startDate: string;

  @ApiProperty({ description: "End date (ISO 8601)", example: "2024-01-31T23:59:59.999Z" })
  @IsISO8601({ strict: true })
  endDate: string;

  @ApiPropertyOptional({ description: "Template ID to apply to created records", nullable: true })
  @IsOptional()
  @IsString()
  templateId?: string | null;
}
