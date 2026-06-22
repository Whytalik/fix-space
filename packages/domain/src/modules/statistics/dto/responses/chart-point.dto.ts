import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ChartPointDto {
  @ApiProperty({ description: "ISO date string", example: "2025-01-15" })
  @Expose()
  date: string;

  @ApiProperty({ description: "Numeric value", example: 1250.5 })
  @Expose()
  value: number;
}
