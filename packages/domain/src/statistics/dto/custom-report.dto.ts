import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { BreakdownGroupDto } from "./breakdown-item.dto";
import { ChartPointDto } from "./chart-point.dto";

export class NumberSeriesDto {
  @ApiProperty({ description: "Property name", example: "Risk %" })
  @Expose()
  propertyName: string;

  @ApiProperty({ description: "Time series of average values", type: [ChartPointDto] })
  @Expose()
  @Type(() => ChartPointDto)
  points: ChartPointDto[];
}

export class CustomReportDto {
  @ApiProperty({ description: "Database ID" })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Database display title", example: "Weekly Watchlist" })
  @Expose()
  title: string;

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
