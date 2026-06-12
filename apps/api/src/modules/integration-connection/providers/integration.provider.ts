import type { IntegrationService } from "@fixspace/domain";

export interface TradeData {
  sourcePositionId: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnL: number;
  fees: number;
  netPnL: number;
  openTime: string;
  closeTime: string;
  currency: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  trades?: TradeData[];
}

export interface ValidationResult {
  valid: boolean;
  accountId?: string;
  error?: string;
}

export interface IntegrationProvider {
  getType(): IntegrationService;
  validateCredentials(credentials: unknown): Promise<ValidationResult>;
  sync(connectionId: string, credentials: unknown, opts?: { startDate?: Date; endDate?: Date }): Promise<SyncResult>;
}
