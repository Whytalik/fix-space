import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { BreakdownGroupDto } from "./breakdown-item.dto";
import { ChartPointDto } from "./chart-point.dto";
import { TradingMetricsDto } from "./trading-metrics.dto";

export class TradingStatsResponseDto {
  @ApiProperty({ description: "Trading metrics for the selected period", type: TradingMetricsDto })
  @Expose()
  @Type(() => TradingMetricsDto)
  metrics: TradingMetricsDto;

  @ApiPropertyOptional({ description: "Trading metrics for the compare period", type: TradingMetricsDto })
  @Expose()
  @Type(() => TradingMetricsDto)
  compareMetrics?: TradingMetricsDto;

  @ApiProperty({ description: "Cumulative P&L equity curve", type: [ChartPointDto] })
  @Expose()
  @Type(() => ChartPointDto)
  equityCurve: ChartPointDto[];

  @ApiProperty({ description: "Breakdowns per SELECT/STATUS property", type: [BreakdownGroupDto] })
  @Expose()
  @Type(() => BreakdownGroupDto)
  breakdowns: BreakdownGroupDto[];
}
