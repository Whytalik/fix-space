import { Injectable } from "@nestjs/common";
import { IntegrationService } from "@fixspace/domain";
import { USDMClient, MainClient } from "binance";
import { IntegrationProvider, SyncResult, ValidationResult, TradeData } from "./integration.provider";
import { AppLogger } from "../../../common/logger/app-logger.service";

export interface BinanceTradeFill {
  symbol: string;
  id: number;
  orderId: number;
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  buyer: boolean;
  maker: boolean;
  positionSide: string;
  realizedPnl: string;
}

interface OrderGroup {
  orderId: number;
  symbol: string;
  positionSide: string;
  buyer: boolean;
  avgPrice: number;
  totalQty: number;
  totalCommission: number;
  totalRealizedPnl: number;
  minTime: number;
  maxTime: number;
  currency: string;
}

@Injectable()
export class BinanceProvider implements IntegrationProvider {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(BinanceProvider.name);
  }

  getType(): IntegrationService {
    return IntegrationService.BINANCE;
  }

  async validateCredentials(credentials: unknown): Promise<ValidationResult> {
    this.logger.debug("Validating Binance credentials");
    const { apiKey, apiSecret } = credentials as Record<string, string>;
    const cleanApiKey = apiKey?.trim();
    const cleanApiSecret = apiSecret?.trim();
    if (!cleanApiKey || !cleanApiSecret) {
      return { valid: false, error: "API key and secret are required" };
    }

    try {
      const client = new MainClient({ api_key: cleanApiKey, api_secret: cleanApiSecret });
      const permissions = await client.getApiKeyPermissions();

      const enableReading = permissions?.enableReading === true;
      const enableWithdrawals = permissions?.enableWithdrawals === true;
      const enableSpotAndMarginTrading = permissions?.enableSpotAndMarginTrading === true;
      const enableFutures = permissions?.enableFutures === true;
      const enableMargin = permissions?.enableMargin === true;

      if (!enableReading) {
        return {
          valid: false,
          error: "API key must have 'Reading' permissions enabled (read-only)",
        };
      }

      if (enableWithdrawals || enableSpotAndMarginTrading || enableFutures || enableMargin) {
        return {
          valid: false,
          error: "API key must be read-only (trading and withdrawals must be disabled)",
        };
      }

      const accountInfo = (await client.getAccountInformation()) as unknown as {
        accoountType?: string;
        accountType?: string;
      };
      const accountType = accountInfo?.accoountType || accountInfo?.accountType || "SPOT";

      return { valid: true, accountId: `${accountType} - ${accountType}` };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn("Binance credential validation failed", { error: message });
      return { valid: false, error: `Invalid credentials: ${message}` };
    }
  }

  async sync(connectionId: string, credentials: unknown, opts?: { startDate?: Date; endDate?: Date }): Promise<SyncResult> {
    this.logger.log("Syncing Binance account", { connectionId });
    const { apiKey, apiSecret } = credentials as Record<string, string>;
    const cleanApiKey = apiKey?.trim();
    const cleanApiSecret = apiSecret?.trim();

    const endDate = opts?.endDate ?? new Date();
    const startDate = opts?.startDate ?? new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const errors: string[] = [];
    const allFills: BinanceTradeFill[] = [];
    const allOrdersMap = new Map<number, any>();

    const usdmClient = new USDMClient({ api_key: cleanApiKey, api_secret: cleanApiSecret });

    try {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const chunks: { start: number; end: number }[] = [];
      let currentStart = startTime;
      while (currentStart < endTime) {
        const currentEnd = Math.min(currentStart + sevenDaysInMs, endTime);
        chunks.push({ start: currentStart, end: currentEnd });
        currentStart = currentEnd + 1;
      }

      const activeSymbols = new Set<string>();

      const account = await usdmClient.getAccountInformation();
      account.positions.forEach((p: any) => {
        if (parseFloat(p.positionAmt) !== 0 || parseFloat(p.unrealizedProfit) !== 0) {
          activeSymbols.add(p.symbol);
        }
      });

      const incomeResults = await this.runInBatches(
        chunks,
        async (chunk) => {
          const income = (await usdmClient.getIncomeHistory({
            startTime: chunk.start,
            endTime: chunk.end,
            limit: 1000,
          })) as any[];
          return income;
        },
        10,
      );

      for (const result of incomeResults) {
        if (result.status === "fulfilled" && result.value) {
          result.value.forEach((incomeItem: any) => activeSymbols.add(incomeItem.symbol));
        }
      }

      this.logger.debug("Found active symbols for sync", { count: activeSymbols.size, symbols: Array.from(activeSymbols) });

      const symbolChunkTasks: { symbol: string; chunk: { start: number; end: number } }[] = [];
      for (const symbol of activeSymbols) {
        for (const chunk of chunks) {
          symbolChunkTasks.push({ symbol, chunk });
        }
      }

      const tradeResults = await this.runInBatches(
        symbolChunkTasks,
        async (task) => {
          const trades = (await usdmClient.getAccountTrades({
            symbol: task.symbol,
            startTime: task.chunk.start,
            endTime: task.chunk.end,
            limit: 1000,
          })) as unknown as BinanceTradeFill[];

          let orders: any[] = [];
          try {
            orders = (await usdmClient.getAllOrders({
              symbol: task.symbol,
              startTime: task.chunk.start,
              endTime: task.chunk.end,
              limit: 1000,
            })) as any[];
          } catch {}

          return { trades: trades ?? [], orders, symbol: task.symbol, chunk: task.chunk };
        },
        5,
      );

      for (const result of tradeResults) {
        if (result.status === "fulfilled") {
          const { trades, orders } = result.value;
          if (trades.length > 0) allFills.push(...trades);
          orders.forEach((o: any) => allOrdersMap.set(o.orderId, o));
        } else {
          const reason = result.reason;
          const errorMessage =
            reason instanceof Error
              ? reason.message
              : typeof reason === "string"
                ? reason
                : (reason?.message ?? reason?.msg ?? JSON.stringify(reason));
          errors.push(`Failed to sync: ${errorMessage}`);
        }
      }
    } catch (error) {
      this.logger.error("Binance sync raw error", { connectionId, error });
      const code = (error as Record<string, unknown>)?.code;
      const message =
        (error as any)?.message ||
        (error as any)?.msg ||
        (error as any)?.body?.message ||
        (error as any)?.body?.msg ||
        (error instanceof Error ? error.message : String(error));
      const userMessage =
        code === -1003
          ? "Binance заблокував IP через забагато запитів. Зачекайте кілька хвилин і спробуйте знову."
          : code === -2014
            ? "Синхронізація не вдалася: API-key format invalid. Переконайтеся, що API-ключ активовано для Futures-торгівлі на Binance."
            : `Синхронізація не вдалася: ${message}`;
      this.logger.error("Binance sync failed", { connectionId, error: userMessage });
      return { synced: 0, skipped: 0, errors: [userMessage] };
    }

    const trades = this.aggregateTrades(allFills, allOrdersMap);

    this.logger.log("Binance sync completed", {
      connectionId,
      totalFills: allFills.length,
      positions: trades.length,
      errors: errors.length,
    });
    return { synced: trades.length, skipped: 0, errors, trades };
  }

  private aggregateTrades(fills: BinanceTradeFill[], ordersMap: Map<number, any>): TradeData[] {
    const orders = this.groupByOrder(fills);
    const byKey = new Map<string, OrderGroup[]>();
    for (const order of orders) {
      const key = `${order.symbol}:${order.positionSide}`;
      const list = byKey.get(key);
      if (list) {
        list.push(order);
      } else {
        byKey.set(key, [order]);
      }
    }

    const trades: TradeData[] = [];

    for (const [, symbolOrders] of byKey) {
      symbolOrders.sort((a, b) => a.minTime - b.minTime);

      const used = new Set<number>();
      for (let i = 0; i < symbolOrders.length - 1; i++) {
        if (used.has(i)) continue;
        const current = symbolOrders[i]!;
        const next = symbolOrders[i + 1]!;
        if (current.buyer !== next.buyer) {
          used.add(i).add(i + 1);

          const closingOrder = ordersMap.get(next.orderId);
          let stopLoss: number | undefined;
          let takeProfit: number | undefined;

          if (closingOrder) {
            if (closingOrder.type === "STOP_MARKET" || closingOrder.type === "STOP") {
              stopLoss = parseFloat(closingOrder.stopPrice);
            } else if (closingOrder.type === "TAKE_PROFIT_MARKET" || closingOrder.type === "TAKE_PROFIT") {
              takeProfit = parseFloat(closingOrder.stopPrice);
            }
          }

          if (!stopLoss || !takeProfit) {
            for (const o of ordersMap.values()) {
              if (o.symbol === current.symbol && o.time >= current.minTime && o.time <= next.maxTime) {
                if (!stopLoss && (o.type === "STOP_MARKET" || o.type === "STOP")) stopLoss = parseFloat(o.stopPrice);
                if (!takeProfit && (o.type === "TAKE_PROFIT_MARKET" || o.type === "TAKE_PROFIT")) takeProfit = parseFloat(o.stopPrice);
              }
            }
          }

          trades.push({
            sourcePositionId: `${current.symbol}-${current.orderId}-${next.orderId}`,
            symbol: current.symbol,
            direction: current.buyer ? "BUY" : "SELL",
            entryPrice: current.avgPrice,
            exitPrice: next.avgPrice,
            quantity: Math.min(current.totalQty, next.totalQty),
            grossPnL: next.totalRealizedPnl + current.totalCommission + next.totalCommission,
            fees: current.totalCommission + next.totalCommission,
            netPnL: next.totalRealizedPnl,
            openTime: new Date(current.minTime).toISOString(),
            closeTime: new Date(next.maxTime).toISOString(),
            currency: current.currency,
            stopLoss,
            takeProfit,
          });
        }
      }

      for (let i = 0; i < symbolOrders.length; i++) {
        if (used.has(i)) continue;
        const unpaired = symbolOrders[i]!;
        trades.push({
          sourcePositionId: `${unpaired.orderId}`,
          symbol: unpaired.symbol,
          direction: unpaired.buyer ? "BUY" : "SELL",
          entryPrice: unpaired.avgPrice,
          exitPrice: unpaired.avgPrice,
          quantity: unpaired.totalQty,
          grossPnL: unpaired.totalRealizedPnl + unpaired.totalCommission,
          fees: unpaired.totalCommission,
          netPnL: unpaired.totalRealizedPnl,
          openTime: new Date(unpaired.minTime).toISOString(),
          closeTime: new Date(unpaired.maxTime).toISOString(),
          currency: unpaired.currency,
        });
      }
    }

    return trades;
  }

  private groupByOrder(fills: BinanceTradeFill[]): OrderGroup[] {
    const groups = new Map<number, BinanceTradeFill[]>();
    for (const fill of fills) {
      const existing = groups.get(fill.orderId);
      if (existing) {
        existing.push(fill);
      } else {
        groups.set(fill.orderId, [fill]);
      }
    }

    const orders: OrderGroup[] = [];
    for (const [, orderFills] of groups) {
      const first = orderFills[0]!;
      let totalQty = 0;
      let totalQuoteQty = 0;
      let totalCommission = 0;
      let totalRealizedPnl = 0;
      let minTime = Infinity;
      let maxTime = -Infinity;

      for (const fill of orderFills) {
        const quantity = parseFloat(fill.qty);
        const price = parseFloat(fill.price);
        totalQty += quantity;
        totalQuoteQty += price * quantity;
        totalCommission += parseFloat(fill.commission);
        totalRealizedPnl += parseFloat(fill.realizedPnl ?? "0");
        if (fill.time < minTime) minTime = fill.time;
        if (fill.time > maxTime) maxTime = fill.time;
      }

      orders.push({
        orderId: first.orderId,
        symbol: first.symbol,
        positionSide: first.positionSide,
        buyer: first.buyer,
        avgPrice: totalQty > 0 ? totalQuoteQty / totalQty : 0,
        totalQty,
        totalCommission,
        totalRealizedPnl,
        minTime,
        maxTime,
        currency: first.commissionAsset ?? "USDT",
      });
    }

    return orders;
  }

  private async runInBatches<T, R>(items: T[], fn: (item: T) => Promise<R>, concurrency: number): Promise<PromiseSettledResult<R>[]> {
    const results: PromiseSettledResult<R>[] = [];
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch.map(fn));
      results.push(...batchResults);
    }
    return results;
  }
}
