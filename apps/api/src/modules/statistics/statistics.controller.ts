import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CustomReportDto, DatabaseStatBlockDto, StatisticsQueryDto, TradingStatsResponseDto } from "@fixspace/domain";

import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";

import { StatisticsService } from "./statistics.service";

@ApiTags("Statistics")
@ApiBearerAuth("access-token")
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get("trading")
  @ApiOperation({ summary: "Get trading statistics from the Trading Journal preset database" })
  @ApiResponse({ status: 200, description: "Trading statistics computed.", type: TradingStatsResponseDto })
  getTradingStats(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getTradingStats(userId, query);
  }

  @Get("custom")
  @ApiOperation({ summary: "Get auto-generated reports for databases with statistics enabled" })
  @ApiResponse({ status: 200, description: "Custom reports computed.", type: [CustomReportDto] })
  getCustomStats(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getCustomStats(userId, query);
  }

  @Get("overview")
  @ApiOperation({ summary: "Get statistics for all key databases" })
  @ApiResponse({ status: 200, description: "Key databases overview computed.", type: [DatabaseStatBlockDto] })
  getKeyDatabasesOverview(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getKeyDatabasesOverview(userId, query);
  }
}
