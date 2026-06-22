import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

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
  @ApiQuery({ name: "spaceId", type: String, required: false, description: "Space ID" })
  @ApiQuery({ name: "from", type: String, required: false, description: "Start of date range (ISO 8601)" })
  @ApiQuery({ name: "to", type: String, required: false, description: "End of date range (ISO 8601)" })
  @ApiQuery({ name: "compareFrom", type: String, required: false, description: "Compare period start (ISO 8601)" })
  @ApiQuery({ name: "compareTo", type: String, required: false, description: "Compare period end (ISO 8601)" })
  @ApiResponse({ status: 200, description: "Trading statistics computed.", type: TradingStatsResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getTradingStats(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getTradingStats(userId, query);
  }

  @Get("custom")
  @ApiOperation({ summary: "Get auto-generated reports for databases with statistics enabled" })
  @ApiQuery({ name: "spaceId", type: String, required: false, description: "Space ID" })
  @ApiQuery({ name: "from", type: String, required: false, description: "Start of date range (ISO 8601)" })
  @ApiQuery({ name: "to", type: String, required: false, description: "End of date range (ISO 8601)" })
  @ApiResponse({ status: 200, description: "Custom reports computed.", type: [CustomReportDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getCustomStats(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getCustomStats(userId, query);
  }

  @Get("overview")
  @ApiOperation({ summary: "Get overview statistics for all databases" })
  @ApiQuery({ name: "spaceId", type: String, required: false, description: "Space ID" })
  @ApiQuery({ name: "from", type: String, required: false, description: "Start of date range (ISO 8601)" })
  @ApiQuery({ name: "to", type: String, required: false, description: "End of date range (ISO 8601)" })
  @ApiQuery({ name: "compareFrom", type: String, required: false, description: "Compare period start (ISO 8601)" })
  @ApiQuery({ name: "compareTo", type: String, required: false, description: "Compare period end (ISO 8601)" })
  @ApiResponse({ status: 200, description: "Databases overview computed.", type: [DatabaseStatBlockDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getKeyDatabasesOverview(@Query() query: StatisticsQueryDto, @CurrentUser("userId") userId: string) {
    return this.statisticsService.getKeyDatabasesOverview(userId, query);
  }
}
