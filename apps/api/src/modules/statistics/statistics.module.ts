import { Module } from "@nestjs/common";

import { LoggerModule } from "@/common/logger/logger.module";

import { StatisticsController } from "./statistics.controller";
import { StatisticsDataModule } from "./statistics-data.module";
import { StatisticsService } from "./statistics.service";

@Module({
  imports: [LoggerModule, StatisticsDataModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService, StatisticsDataModule],
})
export class StatisticsModule {}
