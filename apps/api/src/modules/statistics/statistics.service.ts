import { Injectable } from "@nestjs/common";

import { prisma } from "@fixspace/database";
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

import {
  GenericRecord,
  PropertyBreakdown,
  TradeRecord,
  computeActivityCurve,
  computeBreakdowns,
  computeEquityCurve,
  computeGenericBreakdowns,
  computeMetrics,
  computeNumberSummaries,
  computeRatingAverages,
  emptyMetrics,
  filterByDateRange,
  filterGenericByDateRange,
} from "./utils/trading-stats.util";

@Injectable()
export class StatisticsService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(StatisticsService.name);
  }

  async getTradingStats(userId: string, query: StatisticsQueryDto): Promise<TradingStatsResponseDto> {
    this.logger.debug("Computing trading stats", { userId });

    const db = await prisma.database.findFirst({
      where: { type: "trading-journal", space: { ownerId: userId } },
      include: { properties: true },
    });

    if (!db) {
      return { metrics: emptyMetrics(), equityCurve: [], breakdowns: [] };
    }

    const records = await prisma.record.findMany({
      where: { databaseId: db.id },
      include: { values: true },
    });

    const exitDateProp = db.properties.find((p) => p.integrationKey === "exitDate");
    const netPnlProp = db.properties.find((p) => p.name === "Net P&L");
    const outcomeProp = db.properties.find((p) => p.integrationKey === "outcome");

    const allTrades = records
      .map((record) => {
        const getVal = (propId: string | undefined) => {
          if (!propId) return null;
          return record.values.find((v) => v.propertyId === propId)?.value ?? null;
        };

        const exitDateRaw = exitDateProp ? getVal(exitDateProp.id) : null;
        const exitDate = exitDateRaw ? new Date(exitDateRaw as string) : null;
        if (!exitDate || isNaN(exitDate.getTime())) return null;

        const netPnlRaw = netPnlProp ? getVal(netPnlProp.id) : null;
        const netPnl = netPnlRaw !== null ? Number(netPnlRaw) : 0;
        const outcome = typeof getVal(outcomeProp?.id) === "string" ? (getVal(outcomeProp?.id) as string) : null;

        return { exitDate, netPnl, outcome } satisfies TradeRecord;
      })
      .filter((t): t is TradeRecord => t !== null);

    const trades = filterByDateRange(allTrades, query.from, query.to);

    const metrics = computeMetrics(trades);
    const equityCurve = computeEquityCurve(trades);

    const selectStatusProps = db.properties.filter((p) => p.type === PropertyType.SELECT || p.type === PropertyType.STATUS);

    const breakdownData: PropertyBreakdown[] = selectStatusProps.map((prop) => ({
      propertyName: prop.name,
      propertyId: prop.id,
      records: records
        .map((record) => {
          const exitDateRaw = exitDateProp ? record.values.find((v) => v.propertyId === exitDateProp.id)?.value : null;
          const exitDate = exitDateRaw ? new Date(exitDateRaw as string) : null;
          if (!exitDate || isNaN(exitDate.getTime())) return null;
          const netPnlRaw = netPnlProp ? record.values.find((v) => v.propertyId === netPnlProp.id)?.value : null;
          const valueRaw = record.values.find((v) => v.propertyId === prop.id)?.value;
          const outcomeRaw = outcomeProp ? record.values.find((v) => v.propertyId === outcomeProp.id)?.value : null;

          if (!filterByDateRange([{ exitDate, netPnl: 0, outcome: null }], query.from, query.to).length) return null;

          return {
            value: typeof valueRaw === "string" ? valueRaw : null,
            netPnl: netPnlRaw !== null ? Number(netPnlRaw) : 0,
            outcome: typeof outcomeRaw === "string" ? outcomeRaw : null,
          };
        })
        .filter((r): r is { value: string | null; netPnl: number; outcome: string | null } => r !== null),
    }));

    const breakdowns = computeBreakdowns(breakdownData);

    let compareMetrics: TradingStatsResponseDto["compareMetrics"];
    if (query.compareFrom && query.compareTo) {
      const compareTrades = filterByDateRange(allTrades, query.compareFrom, query.compareTo);
      compareMetrics = computeMetrics(compareTrades);
    }

    this.logger.log("Trading stats computed", { userId, totalTrades: metrics.totalTrades });
    return { metrics, compareMetrics, equityCurve, breakdowns };
  }

  async getCustomStats(userId: string, query: StatisticsQueryDto): Promise<CustomReportDto[]> {
    this.logger.debug("Computing custom stats", { userId });

    const databases = await prisma.database.findMany({
      where: { enableStats: true, space: { ownerId: userId } },
      include: { properties: true },
    });

    const results: CustomReportDto[] = [];

    for (const db of databases) {
      const records = await prisma.record.findMany({
        where: { databaseId: db.id },
        include: { values: true },
      });

      const dateProp = db.properties.find((p) => p.type === PropertyType.DATE);

      const filtered = records.filter((record) => {
        if (!dateProp) return true;
        const dateRaw = record.values.find((v) => v.propertyId === dateProp.id)?.value;
        if (!dateRaw) return true;
        const date = new Date(dateRaw as string);
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

      const breakdowns = computeBreakdowns(breakdownData);

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
        title: db.title,
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
    this.logger.debug("Computing preset overview", { userId });

    const databases = await prisma.database.findMany({
      where: {
        isKey: true,
        space: { ownerId: userId, ...(query.spaceId ? { id: query.spaceId } : {}) },
      },
      include: { properties: true },
      orderBy: { createdAt: "asc" },
    });

    const results: DatabaseStatBlockDto[] = [];

    for (const db of databases) {
      const records = await prisma.record.findMany({
        where: { databaseId: db.id },
        include: { values: true },
      });

      const dateProp = db.properties.find((p) => p.type === PropertyType.DATE);
      const ratingProps = db.properties.filter((p) => p.type === PropertyType.RATING);
      const numberProps = db.properties.filter((p) => p.type === PropertyType.NUMBER);
      const selectStatusProps = db.properties.filter((p) => p.type === PropertyType.SELECT || p.type === PropertyType.STATUS);

      const genericRecords: GenericRecord[] = records.map((record) => {
        const getVal = (propId: string) => record.values.find((v) => v.propertyId === propId)?.value ?? null;

        const dateRaw = dateProp ? getVal(dateProp.id) : null;
        const date = dateRaw ? new Date(dateRaw as string) : null;

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
        title: db.title,
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

        const allTrades = records
          .map((record) => {
            const getVal = (propId: string | undefined) =>
              propId ? (record.values.find((v) => v.propertyId === propId)?.value ?? null) : null;

            const exitDateRaw = exitDateProp ? getVal(exitDateProp.id) : null;
            const exitDate = exitDateRaw ? new Date(exitDateRaw as string) : null;
            if (!exitDate || isNaN(exitDate.getTime())) return null;

            const netPnlRaw = netPnlProp ? getVal(netPnlProp.id) : null;
            const netPnl = netPnlRaw !== null ? Number(netPnlRaw) : 0;
            const outcome = typeof getVal(outcomeProp?.id) === "string" ? (getVal(outcomeProp?.id) as string) : null;

            return { exitDate, netPnl, outcome } satisfies TradeRecord;
          })
          .filter((t): t is TradeRecord => t !== null);

        const trades = filterByDateRange(allTrades, query.from, query.to);
        block.tradingKpis = computeMetrics(trades);
        block.equityCurve = computeEquityCurve(trades);

        if (hasCompare) {
          const compareTrades = filterByDateRange(allTrades, query.compareFrom, query.compareTo);
          block.compareKpis = computeMetrics(compareTrades);
          block.compareEquityCurve = computeEquityCurve(compareTrades);
        }
      }

      results.push(block);
    }

    this.logger.log("Preset overview computed", { userId, dbCount: results.length });
    return results;
  }
}
