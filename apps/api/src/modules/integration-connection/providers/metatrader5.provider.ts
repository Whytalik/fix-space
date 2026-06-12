import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IntegrationService } from "@fixspace/domain";
import { IntegrationProvider, SyncResult, TradeData, ValidationResult } from "./integration.provider";
import { AppLogger } from "../../../common/logger/app-logger.service";

@Injectable()
export class MetaTrader5Provider implements IntegrationProvider {
  private readonly sidecarUrl: string | undefined;
  private readonly sidecarToken: string | undefined;

  constructor(
    private readonly logger: AppLogger,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(MetaTrader5Provider.name);
    this.sidecarUrl = this.config.get<string>("MT5_SIDECAR_URL");
    this.sidecarToken = this.config.get<string>("MT5_SIDECAR_TOKEN");
    if (!this.sidecarUrl) {
      this.logger.warn("MT5_SIDECAR_URL is not set — MetaTrader 5 provider will not function");
    }
  }

  getType(): IntegrationService {
    return IntegrationService.METATRADER5;
  }

  async validateCredentials(credentials: unknown): Promise<ValidationResult> {
    this.logger.debug("Validating MetaTrader 5 credentials");
    const { login, password, server } = credentials as Record<string, string>;

    if (!login || !password || !server) {
      return { valid: false, error: "Login, password, and server are required" };
    }

    if (!this.sidecarUrl) {
      return { valid: false, error: "MT5 sidecar is not configured (missing MT5_SIDECAR_URL)" };
    }

    try {
      const response = await fetch(`${this.sidecarUrl}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.sidecarToken ? { "X-Sidecar-Token": this.sidecarToken } : {}),
        },
        body: JSON.stringify({ login: Number(login), password, server }),
      });

      const data = (await response.json()) as { valid: boolean; error?: string };
      if (!data.valid) {
        this.logger.warn("MetaTrader 5 credential validation failed", { error: data.error });
        return { valid: false, error: data.error ?? "Invalid credentials" };
      }

      return { valid: true, accountId: `${login}@${server}` };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn("MetaTrader 5 sidecar request failed", { error: message });
      return { valid: false, error: `Sidecar error: ${message}` };
    }
  }

  async sync(connectionId: string, credentials: unknown, opts?: { startDate?: Date; endDate?: Date }): Promise<SyncResult> {
    this.logger.log("Syncing MetaTrader 5 account", { connectionId });
    const { login, password, server } = credentials as Record<string, string>;

    if (!this.sidecarUrl) {
      return { synced: 0, skipped: 0, errors: ["MT5 sidecar is not configured (missing MT5_SIDECAR_URL)"] };
    }

    const endDate = opts?.endDate ?? new Date();
    const startDate = opts?.startDate ?? new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${this.sidecarUrl}/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.sidecarToken ? { "X-Sidecar-Token": this.sidecarToken } : {}),
        },
        body: JSON.stringify({
          login: Number(login),
          password,
          server,
          from_date: startDate.toISOString(),
          to_date: endDate.toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn("MT5 sidecar returned error", { connectionId, status: response.status });
        return { synced: 0, skipped: 0, errors: [`Sidecar error ${response.status}: ${text}`] };
      }

      const data = (await response.json()) as { trades?: TradeData[] };
      const trades = data.trades ?? [];

      this.logger.log("MetaTrader 5 sync completed", { connectionId, trades: trades.length });
      return { synced: trades.length, skipped: 0, errors: [], trades };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("MetaTrader 5 sync failed", { connectionId, error: message });
      return { synced: 0, skipped: 0, errors: [`Sync failed: ${message}`] };
    }
  }
}
