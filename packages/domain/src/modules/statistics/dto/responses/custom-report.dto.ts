import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { BreakdownGroupDto } from "./breakdown-item.dto";
import { NumberSeriesDto } from "./number-series.dto";

export class CustomReportDto {
  @ApiProperty({ description: "Database ID" })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Database name", example: "Weekly Watchlist" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Database icon", example: "📋", nullable: true })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Total records in date range", example: 34 })
  @Expose()
  recordCount: number;

  @ApiProperty({ description: "Breakdowns per SELECT/STATUS property", type: [BreakdownGroupDto] })
  @Expose()
  @Type(() => BreakdownGroupDto)
  breakdowns: BreakdownGroupDto[];

  @ApiProperty({ description: "Number field time series", type: [NumberSeriesDto] })
  @Expose()
  @Type(() => NumberSeriesDto)
  numberSeries: NumberSeriesDto[];
}
