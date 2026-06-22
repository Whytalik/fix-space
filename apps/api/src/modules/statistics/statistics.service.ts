import { Injectable } from "@nestjs/common";

import {
  ChartPointDto,
  CustomReportDto,
  NumberSeriesDto,
  DatabaseStatBlockDto,
  PropertyType,
  StatisticsQueryDto,
  TradingStatsResponseDto,
} from "@fixspace/domain";

import { AppLogger } from "@/common/logger/app-logger.service";

import { StatisticsRepository } from "./repositories/statistics.repository";
import {
  GenericRecord,
  PropertyBreakdown,
  computeActivityCurve,
  computeBreakdowns,
  computeCountOnlyBreakdowns,
  computeEquityCurve,
  computeGenericBreakdowns,
  computeMetrics,
  computeNumberSummaries,
  computeRatingAverages,
  emptyMetrics,
  filterByDateRange,
  filterGenericByDateRange,
  toTradeRecords,
} from "./utils/trading-stats.util";

@Injectable()
export class StatisticsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly statisticsRepository: StatisticsRepository,
  ) {
    this.logger.setContext(StatisticsService.name);
  }

  async getTradingStats(userId: string, query: StatisticsQueryDto): Promise<TradingStatsResponseDto> {
    this.logger.debug("Computing trading stats", { userId });

    const db = await this.statisticsRepository.findTradingJournalDb(userId);

    if (!db) {
      return { metrics: emptyMetrics(), equityCurve: [], breakdowns: [] };
    }

    const records = await this.statisticsRepository.findRecordsByDatabaseId(db.id);

    const exitDateProp = db.properties.find((p) => p.integrationKey === "exitDate");
    const netPnlProp = db.properties.find((p) => p.name === "Net P&L");
    const outcomeProp = db.properties.find((p) => p.integrationKey === "outcome");

    const allTrades = toTradeRecords(records, exitDateProp, netPnlProp, outcomeProp);

    const trades = filterByDateRange(allTrades, query.from, query.to);

    const metrics = computeMetrics(trades);
    const equityCurve = computeEquityCurve(trades);

    const selectStatusProps = db.properties.filter((p) => p.type === PropertyType.SELECT || p.type === PropertyType.STATUS);

    const breakdownData: PropertyBreakdown[] = selectStatusProps.map((prop) => ({
      propertyName: prop.name,
      propertyId: prop.id,
      records: toTradeRecords(records, exitDateProp, netPnlProp, outcomeProp)
        .filter((t) => filterByDateRange([t], query.from, query.to).length > 0)
        .map((t) => {
          const matchingRecord = records.find((r) => {
            const exitDateRaw = r.values.find((v) => v.propertyId === exitDateProp?.id)?.value;
            return exitDateRaw === t.exitDate.toISOString();
          });
          const valueRaw = matchingRecord ? matchingRecord.values.find((v) => v.propertyId === prop.id)?.value : null;
          return {
            value: typeof valueRaw === "string" ? valueRaw : null,
            netPnl: t.netPnl,
            outcome: t.outcome,
          };
        }),
    }));

    const breakdowns = computeBreakdowns(breakdownData);

    let compareMetrics: TradingStatsResponseDto["compareMetrics"];
    if (query.compareFrom && query.compareTo) {
      const compareTrades = filterByDateRange(allTrades, query.compareFrom, query.compareTo);
      compareMetrics = compareTrades.length > 0 ? computeMetrics(compareTrades) : undefined;
    }

    this.logger.log("Trading stats computed", { userId, totalTrades: metrics.totalTrades });
    return { metrics, compareMetrics, equityCurve, breakdowns };
  }

  async getCustomStats(userId: string, query: StatisticsQueryDto): Promise<CustomReportDto[]> {
    this.logger.debug("Computing custom stats", { userId });

    const databases = await this.statisticsRepository.findAllDatabases(userId);

    if (databases.length === 0) return [];

    const dbIds = databases.map((db) => db.id);
    const allRecords = await this.statisticsRepository.findRecordsByDatabaseIds(dbIds);

    const recordsByDbId = new Map<string, typeof allRecords>();
    for (const record of allRecords) {
      const bucket = recordsByDbId.get(record.databaseId) ?? [];
      bucket.push(record);
      recordsByDbId.set(record.databaseId, bucket);
    }

    const results: CustomReportDto[] = [];

    for (const db of databases) {
      const records = recordsByDbId.get(db.id) ?? [];

      const dateProp = db.properties.find((p) => p.type === PropertyType.DATE);

      const filtered = records.filter((record) => {
        if (!dateProp) return true;
        const dateRaw = record.values.find((v) => v.propertyId === dateProp.id)?.value;
        if (!dateRaw || typeof dateRaw !== "string") return true;
        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) return true;
        const from = query.from ? new Date(query.from) : null;
        const to = query.to ? new Date(query.to) : null;
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      });

      const selectStatusProps = db.properties.filter((p) => p.type === PropertyType.SELECT || p.type === PropertyType.STATUS);

      const breakdownData: PropertyBreakdown[] = selectStatusProps.map((prop) => ({
        propertyName: prop.name,
        propertyId: prop.id,
        records: filtered.map((record) => {
          const val = record.values.find((v) => v.propertyId === prop.id)?.value;
          return { value: typeof val === "string" ? val : null, netPnl: 0, outcome: null };
        }),
      }));

      const breakdowns = computeCountOnlyBreakdowns(breakdownData);

      const numberProps = db.properties.filter((p) => p.type === PropertyType.NUMBER);
      const numberSeries: NumberSeriesDto[] = numberProps.map((prop) => {
        const points: ChartPointDto[] = [];

        if (dateProp) {
          const byDate = new Map<string, number[]>();
          for (const record of filtered) {
            const dateRaw = record.values.find((v) => v.propertyId === dateProp.id)?.value;
            const numRaw = record.values.find((v) => v.propertyId === prop.id)?.value;
            if (!dateRaw || numRaw === null || numRaw === undefined) continue;
            const dateKey = new Date(dateRaw as string).toISOString().slice(0, 10);
            const bucket = byDate.get(dateKey) ?? [];
            bucket.push(Number(numRaw));
            byDate.set(dateKey, bucket);
          }
          for (const [date, vals] of Array.from(byDate.entries()).sort()) {
            const average = vals.reduce((a, b) => a + b, 0) / vals.length;
            points.push({ date, value: Math.round(average * 100) / 100 });
          }
        }

        return { propertyName: prop.name, points };
      });

      results.push({
        databaseId: db.id,
        name: db.name,
        icon: db.icon,
        recordCount: filtered.length,
        breakdowns,
        numberSeries,
      });
    }

    this.logger.log("Custom stats computed", { userId, dbCount: results.length });
    return results;
  }

  async getKeyDatabasesOverview(userId: string, query: StatisticsQueryDto): Promise<DatabaseStatBlockDto[]> {
    this.logger.debug("Computing overview for all databases", { userId });

    const databases = await this.statisticsRepository.findAllDatabases(userId, query.spaceId);

    if (databases.length === 0) return [];

    const dbIds = databases.map((db) => db.id);
    const allRecords = await this.statisticsRepository.findRecordsByDatabaseIds(dbIds);

    const recordsByDbId = new Map<string, typeof allRecords>();
    for (const record of allRecords) {
      const bucket = recordsByDbId.get(record.databaseId) ?? [];
      bucket.push(record);
      recordsByDbId.set(record.databaseId, bucket);
    }

    const results: DatabaseStatBlockDto[] = [];

    for (const db of databases) {
      const records = recordsByDbId.get(db.id) ?? [];

      const dateProp = db.properties.find((p) => p.type === PropertyType.DATE);
      const ratingProps = db.properties.filter((p) => p.type === PropertyType.RATING);
      const numberProps = db.properties.filter((p) => p.type === PropertyType.NUMBER);
      const selectStatusProps = db.properties.filter((p) => p.type === PropertyType.SELECT || p.type === PropertyType.STATUS);

      const genericRecords: GenericRecord[] = records.map((record) => {
        const getVal = (propId: string) => record.values.find((v) => v.propertyId === propId)?.value ?? null;

        const dateRaw = dateProp ? getVal(dateProp.id) : null;
        const date = dateRaw && typeof dateRaw === "string" ? new Date(dateRaw as string) : null;

        return {
          date: date && !isNaN(date.getTime()) ? date : null,
          ratingValues: ratingProps.map((p) => ({ propertyId: p.id, value: Number(getVal(p.id) ?? 0) })).filter((v) => v.value > 0),
          numberValues: numberProps
            .map((p) => ({ propertyId: p.id, value: Number(getVal(p.id) ?? 0) }))
            .filter((v) => !isNaN(v.value) && v.value !== 0),
          selectValues: selectStatusProps.map((p) => ({
            propertyId: p.id,
            value: typeof getVal(p.id) === "string" ? (getVal(p.id) as string) : null,
          })),
        };
      });

      const filtered = filterGenericByDateRange(genericRecords, query.from, query.to);
      const hasCompare = !!(query.compareFrom && query.compareTo);
      const compareFiltered = hasCompare ? filterGenericByDateRange(genericRecords, query.compareFrom, query.compareTo) : null;

      const activityCurve = computeActivityCurve(filtered);
      const breakdowns = computeGenericBreakdowns(filtered, selectStatusProps);
      const ratingAverages = computeRatingAverages(filtered, ratingProps);
      const numberSummaries = computeNumberSummaries(filtered, numberProps);

      const block: DatabaseStatBlockDto = {
        databaseId: db.id,
        type: db.type ?? "unknown",
        name: db.name,
        icon: db.icon,
        recordCount: filtered.length,
        activityCurve,
        breakdowns,
        ratingAverages,
        numberSummaries,
      };

      if (compareFiltered) {
        block.compareRecordCount = compareFiltered.length;
        block.compareActivityCurve = computeActivityCurve(compareFiltered);
        block.compareBreakdowns = computeGenericBreakdowns(compareFiltered, selectStatusProps);
        block.compareRatingAverages = computeRatingAverages(compareFiltered, ratingProps);
        block.compareNumberSummaries = computeNumberSummaries(compareFiltered, numberProps);
      }

      if (db.type === "trading-journal") {
        const exitDateProp = db.properties.find((p) => p.integrationKey === "exitDate");
        const netPnlProp = db.properties.find((p) => p.name === "Net P&L");
        const outcomeProp = db.properties.find((p) => p.integrationKey === "outcome");

        const allTrades = toTradeRecords(records, exitDateProp, netPnlProp, outcomeProp);

        const trades = filterByDateRange(allTrades, query.from, query.to);
        block.tradingKpis = computeMetrics(trades);
        block.equityCurve = computeEquityCurve(trades);

        if (hasCompare) {
          const compareTrades = filterByDateRange(allTrades, query.compareFrom, query.compareTo);
          block.compareKpis = compareTrades.length > 0 ? computeMetrics(compareTrades) : undefined;
          block.compareEquityCurve = compareTrades.length > 0 ? computeEquityCurve(compareTrades) : undefined;
        }
      }

      results.push(block);
    }

    this.logger.log("Preset overview computed", { userId, dbCount: results.length });
    return results;
  }
}
