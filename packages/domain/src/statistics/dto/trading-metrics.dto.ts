import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class TradingMetricsDto {
  @ApiProperty({ description: "Total number of closed trades", example: 87 })
  @Expose()
  totalTrades: number;

  @ApiProperty({ description: "Win rate (0–1)", example: 0.57 })
  @Expose()
  winRate: number;

  @ApiProperty({ description: "Profit factor (gross profit / gross loss)", example: 1.82 })
  @Expose()
  profitFactor: number;

  @ApiProperty({ description: "Expectancy in currency units", example: 47.3 })
  @Expose()
  expectancy: number;

  @ApiProperty({ description: "Total net P&L", example: 4115.1 })
  @Expose()
  totalPnl: number;

  @ApiProperty({ description: "Average net P&L per trade", example: 47.3 })
  @Expose()
  avgPnl: number;

  @ApiProperty({ description: "Average win (closed winning trades)", example: 213.5 })
  @Expose()
  avgWin: number;

  @ApiProperty({ description: "Average loss (closed losing trades, positive number)", example: 98.2 })
  @Expose()
  avgLoss: number;

  @ApiProperty({ description: "Best single trade net P&L", example: 870 })
  @Expose()
  bestTrade: number;

  @ApiProperty({ description: "Worst single trade net P&L", example: -320 })
  @Expose()
  worstTrade: number;

  @ApiProperty({ description: "Maximum drawdown from peak (positive number)", example: 1200 })
  @Expose()
  maxDrawdown: number;

  @ApiProperty({ description: "Gross profit (sum of positive trades)", example: 10540 })
  @Expose()
  grossProfit: number;

  @ApiProperty({ description: "Gross loss (sum of negative trades, positive number)", example: 5790 })
  @Expose()
  grossLoss: number;
}
