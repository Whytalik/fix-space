import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601 } from "class-validator";

export class PreviewTradesDto {
  @ApiProperty({ description: "Start date (ISO 8601)", example: "2024-01-01T00:00:00.000Z" })
  @IsISO8601({ strict: true })
  startDate: string;

  @ApiProperty({ description: "End date (ISO 8601)", example: "2024-01-31T23:59:59.999Z" })
  @IsISO8601({ strict: true })
  endDate: string;
}
