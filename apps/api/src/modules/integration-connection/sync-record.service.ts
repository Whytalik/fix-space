import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { AppLogger } from "@/common/logger/app-logger.service";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import type { TradeData } from "./providers/integration.provider";

const REQUIRED_INTEGRATION_KEYS = [
  "pair",
  "direction",
  "entryPrice",
  "exitPrice",
  "quantity",
  "entryDate",
  "exitDate",
  "fees",
  "outcome",
  "status",
] as const;

const KEY_LABELS: Record<string, string> = {
  pair: "Pair",
  direction: "Direction",
  entryPrice: "Entry Price",
  exitPrice: "Exit Price",
  quantity: "Quantity",
  entryDate: "Entry Date",
  exitDate: "Exit Date",
  fees: "Fees",
  outcome: "Outcome",
  status: "Status",
  stopLoss: "Stop Loss",
  takeProfit: "Take Profit",
};

const NAME_TO_KEY_MAP: Record<string, string> = {
  Status: "status",
  Pair: "pair",
  Direction: "direction",
  "Entry Price": "entryPrice",
  "Exit Price": "exitPrice",
  Quantity: "quantity",
  "Entry Date": "entryDate",
  "Exit Date": "exitDate",
  "Initial SL": "stopLoss",
  "Initial TP": "takeProfit",
  Fees: "fees",
  Outcome: "outcome",
};

export interface PersistResult {
  created: number;
  skipped: number;
  noJournal: boolean;
  missingProperties: string[];
  createdRecordIds: string[];
  journalDatabaseId: string | null;
}

@Injectable()
export class SyncRecordService {
  constructor(
    private readonly logger: AppLogger,
    private readonly databaseRepo: DatabaseRepository,
    private readonly propertyRepo: PropertyRepository,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(SyncRecordService.name);
  }

  async persistTrades(
    userId: string,
    connectionId: string,
    serviceLabel: string,
    trades: TradeData[],
    spaceId: string,
  ): Promise<PersistResult> {
    if (trades.length === 0) {
      return { created: 0, skipped: 0, noJournal: false, missingProperties: [], createdRecordIds: [], journalDatabaseId: null };
    }

    const tradingJournal = await this.databaseRepo.findByTypeInSpace("trading-journal", spaceId);

    if (!tradingJournal) {
      this.logger.warn("No Trading Journal database found in space", { spaceId, userId });
      return { created: 0, skipped: trades.length, noJournal: true, missingProperties: [], createdRecordIds: [], journalDatabaseId: null };
    }

    const properties = await this.propertyRepo.findManyByDatabase(tradingJournal.id);

    const hasMissingKeys = properties.some((prop) => !prop.integrationKey && NAME_TO_KEY_MAP[prop.name]);
    if (hasMissingKeys) {
      this.logger.log("Auto-healing missing integrationKeys on Trading Journal properties", { databaseId: tradingJournal.id });
      for (const prop of properties) {
        if (!prop.integrationKey) {
          const key = NAME_TO_KEY_MAP[prop.name];
          if (key) {
            await prisma.property.update({
              where: { id: prop.id },
              data: { integrationKey: key },
            });
            prop.integrationKey = key;
          }
        }
      }
    }

    const keyMap = new Map<string, string>();
    for (const prop of properties) {
      if (prop.integrationKey) {
        keyMap.set(prop.integrationKey, prop.id);
      }
    }

    const missingProperties = REQUIRED_INTEGRATION_KEYS.filter((key) => !keyMap.has(key)).map((key) => KEY_LABELS[key] ?? key);

    const existing = await this.recordRepo.findBySourceIntegration(
      connectionId,
      trades.map((trade) => trade.sourcePositionId),
    );
    const existingIds = new Set(existing.map((r) => r.sourcePositionId));

    const toCreate = trades.filter((trade) => !existingIds.has(trade.sourcePositionId));
    if (toCreate.length === 0) {
      return {
        created: 0,
        skipped: trades.length,
        noJournal: false,
        missingProperties,
        createdRecordIds: [],
        journalDatabaseId: tradingJournal.id,
      };
    }

    let created = 0;
    const createdRecordIds: string[] = [];
    try {
      await prisma.$transaction(async (transaction) => {
        for (const trade of toCreate) {
          const directionLabel = trade.direction === "BUY" ? "Long" : "Short";
          const outcome = trade.netPnL > 0 ? "Win" : trade.netPnL < 0 ? "Loss" : "Breakeven";

          const record = await transaction.record.create({
            data: {
              databaseId: tradingJournal.id,
              name: `${trade.symbol} ${directionLabel}`,
              sourceIntegrationId: connectionId,
              sourceLabel: serviceLabel,
              sourcePositionId: trade.sourcePositionId,
              sourceCurrency: trade.currency,
            },
          });

          createdRecordIds.push(record.id);

          const propertyValues: { propertyId: string; value: unknown }[] = [];

          const addValue = (key: string, value: unknown) => {
            const id = keyMap.get(key);
            if (id && value !== undefined && value !== null) {
              propertyValues.push({ propertyId: id, value });
            }
          };

          addValue("pair", trade.symbol);
          addValue("direction", directionLabel);
          addValue("entryPrice", trade.entryPrice);
          addValue("exitPrice", trade.exitPrice);
          addValue("quantity", trade.quantity);
          addValue("fees", trade.fees);
          addValue("entryDate", trade.openTime);
          addValue("exitDate", trade.closeTime);
          addValue("outcome", outcome);
          addValue("status", "Closed");
          addValue("stopLoss", trade.stopLoss);
          addValue("takeProfit", trade.takeProfit);

          for (const propertyValue of propertyValues) {
            await transaction.propertyValue.create({
              data: {
                recordId: record.id,
                propertyId: propertyValue.propertyId,
                value: propertyValue.value as Prisma.InputJsonValue,
                computed: false,
              },
            });
          }

          created++;
        }
      });
    } catch (error) {
      this.logger.error("Batch record creation failed, rolling back", {
        connectionId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        created: 0,
        skipped: trades.length,
        noJournal: false,
        missingProperties,
        createdRecordIds: [],
        journalDatabaseId: tradingJournal.id,
      };
    }

    this.logger.log("Sync records persisted", { userId, connectionId, created, skipped: trades.length - created });
    return {
      created,
      skipped: trades.length - created,
      noJournal: false,
      missingProperties,
      createdRecordIds,
      journalDatabaseId: tradingJournal.id,
    };
  }

  async findJournalDatabaseId(spaceId: string): Promise<string | null> {
    const tradingJournal = await this.databaseRepo.findByTypeInSpace("trading-journal", spaceId);
    return tradingJournal?.id ?? null;
  }

  async annotateExisting(connectionId: string, trades: TradeData[]): Promise<Array<TradeData & { alreadyImported: boolean }>> {
    if (trades.length === 0) return [];
    const existing = await this.recordRepo.findBySourceIntegration(
      connectionId,
      trades.map((trade) => trade.sourcePositionId),
    );
    const existingIds = new Set(existing.map((r) => r.sourcePositionId));
    return trades.map((trade) => ({ ...trade, alreadyImported: existingIds.has(trade.sourcePositionId) }));
  }
}
