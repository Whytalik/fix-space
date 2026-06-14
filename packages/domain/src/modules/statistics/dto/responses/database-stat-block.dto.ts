import type { BreakdownGroupDto } from "./breakdown-item.dto";
import type { ChartPointDto } from "./chart-point.dto";
import type { NumberSummaryDto } from "./number-summary.dto";
import type { RatingAverageDto } from "./rating-average.dto";
import type { TradingMetricsDto } from "./trading-metrics.dto";

export class DatabaseStatBlockDto {
  databaseId: string;
  type: string;
  name: string;
  icon: string | null;
  recordCount: number;
  compareRecordCount?: number;
  activityCurve: ChartPointDto[];
  compareActivityCurve?: ChartPointDto[];
  breakdowns: BreakdownGroupDto[];
  compareBreakdowns?: BreakdownGroupDto[];
  ratingAverages: RatingAverageDto[];
  compareRatingAverages?: RatingAverageDto[];
  numberSummaries: NumberSummaryDto[];
  compareNumberSummaries?: NumberSummaryDto[];
  tradingKpis?: TradingMetricsDto;
  compareKpis?: TradingMetricsDto;
  equityCurve?: ChartPointDto[];
  compareEquityCurve?: ChartPointDto[];
}
