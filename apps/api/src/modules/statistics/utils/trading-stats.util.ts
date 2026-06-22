import type {
  BreakdownGroupDto,
  BreakdownItemDto,
  ChartPointDto,
  NumberSummaryDto,
  RatingAverageDto,
  TradingMetricsDto,
} from "@fixspace/domain";

export interface TradeRecord {
  netPnl: number;
  outcome: string | null;
  exitDate: Date;
}

export interface PropertyBreakdown {
  propertyName: string;
  propertyId: string;
  records: { value: string | null; netPnl: number; outcome: string | null }[];
}

export interface GenericRecord {
  date: Date | null;
  ratingValues: { propertyId: string; value: number }[];
  numberValues: { propertyId: string; value: number }[];
  selectValues: { propertyId: string; value: string | null }[];
}

export interface DatabaseProperties {
  id: string;
  name: string;
  type: string;
  integrationKey: string | null;
}

function parseDateSafe(raw: unknown): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

function parseNumberSafe(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const num = Number(raw);
  return isNaN(num) ? null : num;
}

function getValue(values: { propertyId: string; value: unknown }[], propId: string | undefined): unknown {
  if (!propId) return null;
  return values.find((v) => v.propertyId === propId)?.value ?? null;
}

export function toTradeRecords(
  records: { id: string; values: { propertyId: string; value: unknown }[] }[],
  exitDateProp: { id: string } | undefined,
  netPnlProp: { id: string } | undefined,
  outcomeProp: { id: string } | undefined,
): TradeRecord[] {
  return records
    .map((record) => {
      const exitDateRaw = getValue(record.values, exitDateProp?.id);
      const exitDate = parseDateSafe(exitDateRaw);
      if (!exitDate) return null;

      const netPnlRaw = getValue(record.values, netPnlProp?.id);
      const netPnl = parseNumberSafe(netPnlRaw) ?? 0;
      const outcome =
        typeof getValue(record.values, outcomeProp?.id) === "string" ? (getValue(record.values, outcomeProp?.id) as string) : null;

      return { exitDate, netPnl, outcome } satisfies TradeRecord;
    })
    .filter((t): t is TradeRecord => t !== null);
}

export function emptyMetrics(): TradingMetricsDto {
  return {
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    expectancy: 0,
    totalPnl: 0,
    avgPnl: 0,
    avgWin: 0,
    avgLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    maxDrawdown: 0,
    grossProfit: 0,
    grossLoss: 0,
  };
}

export function computeMetrics(trades: TradeRecord[]): TradingMetricsDto {
  if (trades.length === 0) return emptyMetrics();

  const wins = trades.filter((t) => t.outcome?.toLowerCase() === "win");
  const losses = trades.filter((t) => t.outcome?.toLowerCase() === "loss");

  const grossProfit = wins.reduce((sum, t) => sum + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
  const totalPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);

  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const avgPnl = totalPnl / trades.length;
  const pnls = trades.map((t) => t.netPnl);
  const bestTrade = Math.max(...pnls);
  const worstTrade = Math.min(...pnls);

  const sorted = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());
  let peak = 0;
  let cumulative = 0;
  let maxDrawdown = 0;
  for (const trade of sorted) {
    cumulative += trade.netPnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    totalTrades: trades.length,
    winRate: round(winRate, 4),
    profitFactor: round(profitFactor, 2),
    expectancy: round(avgPnl, 2),
    totalPnl: round(totalPnl, 2),
    avgPnl: round(avgPnl, 2),
    avgWin: round(avgWin, 2),
    avgLoss: round(avgLoss, 2),
    bestTrade: round(bestTrade, 2),
    worstTrade: round(worstTrade, 2),
    maxDrawdown: round(maxDrawdown, 2),
    grossProfit: round(grossProfit, 2),
    grossLoss: round(grossLoss, 2),
  };
}

export function computeEquityCurve(trades: TradeRecord[]): ChartPointDto[] {
  if (trades.length === 0) return [];

  const sorted = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());
  let cumulative = 0;
  return sorted.map((trade) => {
    cumulative += trade.netPnl;
    return { date: trade.exitDate.toISOString().slice(0, 10), value: round(cumulative, 2) };
  });
}

export function computeBreakdowns(data: PropertyBreakdown[]): BreakdownGroupDto[] {
  return data.map((prop) => {
    const groups = new Map<string, TradeRecord[]>();

    for (const row of prop.records) {
      const label = row.value ?? "—";
      const bucket = groups.get(label) ?? [];
      bucket.push({ netPnl: row.netPnl, outcome: row.outcome, exitDate: new Date() });
      groups.set(label, bucket);
    }

    const items: BreakdownItemDto[] = Array.from(groups.entries())
      .map(([label, group]) => {
        const wins = group.filter((t) => t.outcome?.toLowerCase() === "win").length;
        const totalPnl = group.reduce((s, t) => s + t.netPnl, 0);
        return {
          label,
          count: group.length,
          winRate: round(group.length > 0 ? wins / group.length : 0, 4),
          avgPnl: round(group.length > 0 ? totalPnl / group.length : 0, 2),
          totalPnl: round(totalPnl, 2),
        };
      })
      .sort((a, b) => b.count - a.count);

    return { propertyName: prop.propertyName, items };
  });
}

export function computeCountOnlyBreakdowns(data: PropertyBreakdown[]): BreakdownGroupDto[] {
  return data.map((prop) => {
    const groups = new Map<string, number>();

    for (const row of prop.records) {
      const label = row.value ?? "—";
      groups.set(label, (groups.get(label) ?? 0) + 1);
    }

    const items: BreakdownItemDto[] = Array.from(groups.entries())
      .map(([label, count]) => ({
        label,
        count,
        winRate: 0,
        avgPnl: 0,
        totalPnl: 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { propertyName: prop.propertyName, items };
  });
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function filterByDateRange(trades: TradeRecord[], from?: string, to?: string): TradeRecord[] {
  const fromDate = from ? parseDateSafe(from) : null;
  const toDate = to ? parseDateSafe(to) : null;
  return trades.filter((t) => {
    if (fromDate && t.exitDate < fromDate) return false;
    if (toDate && t.exitDate > toDate) return false;
    return true;
  });
}

export function filterGenericByDateRange(records: GenericRecord[], from?: string, to?: string): GenericRecord[] {
  const fromDate = from ? parseDateSafe(from) : null;
  const toDate = to ? parseDateSafe(to) : null;
  return records.filter((r) => {
    if (!r.date) return true;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });
}

export function computeActivityCurve(records: GenericRecord[]): ChartPointDto[] {
  const byDate = new Map<string, number>();
  for (const record of records) {
    if (!record.date) continue;
    const key = record.date.toISOString().slice(0, 10);
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function computeRatingAverages(records: GenericRecord[], props: { id: string; name: string }[]): RatingAverageDto[] {
  return props.map((prop) => {
    const values = records.flatMap((r) => r.ratingValues.filter((v) => v.propertyId === prop.id).map((v) => v.value));
    const count = values.length;
    const average = count > 0 ? round(values.reduce((s, v) => s + v, 0) / count, 2) : 0;
    return { propertyName: prop.name, average, count };
  });
}

export function computeNumberSummaries(records: GenericRecord[], props: { id: string; name: string }[]): NumberSummaryDto[] {
  return props.map((prop) => {
    const values = records.flatMap((r) => r.numberValues.filter((v) => v.propertyId === prop.id).map((v) => v.value));
    const count = values.length;
    const sum = round(
      values.reduce((s, v) => s + v, 0),
      2,
    );
    const average = count > 0 ? round(sum / count, 2) : 0;
    return { propertyName: prop.name, sum, average, count };
  });
}

export function computeGenericBreakdowns(records: GenericRecord[], props: { id: string; name: string }[]): BreakdownGroupDto[] {
  return props
    .map((prop) => {
      const groups = new Map<string, number>();
      for (const record of records) {
        const selectValue = record.selectValues.find((v) => v.propertyId === prop.id);
        const label = selectValue?.value ?? "—";
        groups.set(label, (groups.get(label) ?? 0) + 1);
      }
      const items: BreakdownItemDto[] = Array.from(groups.entries())
        .map(([label, count]) => ({ label, count, winRate: 0, avgPnl: 0, totalPnl: 0 }))
        .sort((a, b) => b.count - a.count);
      return { propertyName: prop.name, items };
    })
    .filter((group) => group.items.length > 0);
}
