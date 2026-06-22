import { Module } from "@nestjs/common";
import { StatisticsRepository } from "./repositories/statistics.repository";

@Module({
  providers: [StatisticsRepository],
  exports: [StatisticsRepository],
})
export class StatisticsDataModule {}
