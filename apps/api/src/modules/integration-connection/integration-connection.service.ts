import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import {
  CreateIntegrationConnectionDto,
  IntegrationConnectionResponseDto,
  IntegrationService,
  IntegrationTradeDto,
  ImportTradesDto,
  PreviewTradesDto,
  PreviewTradesResponseDto,
  SERVICE_LIMITS,
  UpdateIntegrationConnectionDto,
} from "@fixspace/domain";
import { NotificationType, IntegrationStatus as DbIntegrationStatus, prisma } from "@fixspace/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";
import { decryptCredentials, encryptCredentials } from "./utils/credentials.util";
import { MT5WebhookDto } from "./dto/mt5-webhook.dto";
import { IntegrationConnectionRepository } from "./repositories/integration-connection.repository";
import { IntegrationProviderFactory } from "./providers/provider.factory";
import { NotificationService } from "../notification/notification.service";
import { RecordService } from "../record/record.service";
import { RecordRepository } from "../record/repositories/record.repository";
import { SyncRecordService } from "./sync-record.service";
import { CacheService } from "../../core/cache/cache.service";
import type { SyncResult, TradeData } from "./providers/integration.provider";
import { InitializeUserSpaceUseCase } from "../space/providers/initialize-user-space.usecase";

@Injectable()
export class IntegrationConnectionService {
  constructor(
    private readonly logger: AppLogger,
    private readonly integrationRepo: IntegrationConnectionRepository,
    private readonly providerFactory: IntegrationProviderFactory,
    private readonly syncRecordService: SyncRecordService,
    private readonly notificationService: NotificationService,
    private readonly recordService: RecordService,
    private readonly recordRepo: RecordRepository,
    private readonly cacheService: CacheService,
    private readonly initializeUserSpaceUseCase: InitializeUserSpaceUseCase,
  ) {
    this.logger.setContext(IntegrationConnectionService.name);
  }

  async findAll(userId: string): Promise<IntegrationConnectionResponseDto[]> {
    this.logger.debug("Listing integration connections", { userId });
    const connections = await this.integrationRepo.findAllByUser(userId);
    return connections.map((connection) => {
      const response = new IntegrationConnectionResponseDto(connection as unknown as Partial<IntegrationConnectionResponseDto>);
      if (connection.service === IntegrationService.METATRADER5 && connection.credentials) {
        try {
          const decrypted = decryptCredentials(connection.credentials as unknown as Record<string, string>) as any;
          response.apiToken = decrypted.apiToken;
        } catch (e) {
          this.logger.error("Failed to decrypt credentials for findAll", { error: e instanceof Error ? e.message : String(e) });
        }
      }
      return response;
    });
  }

  async findOne(id: string, userId: string): Promise<IntegrationConnectionResponseDto> {
    this.logger.debug("Getting integration connection", { id });
    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));

    const response = new IntegrationConnectionResponseDto(connection as unknown as Partial<IntegrationConnectionResponseDto>);
    if (connection.service === IntegrationService.METATRADER5 && connection.credentials) {
      try {
        const decrypted = decryptCredentials(connection.credentials as unknown as Record<string, string>) as any;
        response.apiToken = decrypted.apiToken;
      } catch (e) {
        this.logger.error("Failed to decrypt credentials for findOne", { error: e instanceof Error ? e.message : String(e) });
      }
    }
    return response;
  }

  async create(userId: string, dto: CreateIntegrationConnectionDto): Promise<IntegrationConnectionResponseDto> {
    this.logger.debug("Creating integration connection", { userId, service: dto.service, spaceId: dto.spaceId });

    const space = await prisma.space.findFirst({ where: { id: dto.spaceId, ownerId: userId } });
    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND"));
    }

    const limit = SERVICE_LIMITS[dto.service];
    if (limit !== undefined) {
      const count = await this.integrationRepo.countBySpaceAndService(dto.spaceId, dto.service);
      if (count >= limit) {
        throw new BadRequestException(t("errors.INTEGRATION_CONNECTION_LIMIT_REACHED", { service: dto.service, limit }));
      }
    }

    if (dto.credentials) {
      dto.credentials = trimCredentials(dto.credentials as unknown as Record<string, unknown>) as any;
    }

    if (dto.service === IntegrationService.METATRADER5) {
      if (!dto.credentials) dto.credentials = {} as any;
      if (!(dto.credentials as any).apiToken) {
        (dto.credentials as any).apiToken = `sk_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
      }
    }

    const encryptedCredentials = encryptCredentials(dto.credentials as unknown as Record<string, unknown>);

    const connection = await this.integrationRepo.create({
      userId,
      spaceId: dto.spaceId,
      service: dto.service,
      name: dto.name,
      credentials: encryptedCredentials,
      syncInterval: dto.syncInterval ?? 5,
      marketType: dto.marketType,
      status: dto.service === IntegrationService.METATRADER5 ? DbIntegrationStatus.ACTIVE : DbIntegrationStatus.INACTIVE,
    });

    if (dto.service !== IntegrationService.METATRADER5) {
      const provider = this.providerFactory.get(dto.service);
      void this.deployAsync(connection.id, dto, provider);
    }

    await this.notificationService.create(
      userId,
      NotificationType.INTEGRATION,
      t("notifications.integration_created", { service: dto.service }),
      "/settings",
    );

    this.logger.log("Integration connection created (Pending)", { connectionId: connection.id, service: dto.service });
    const response = new IntegrationConnectionResponseDto(connection as unknown as Partial<IntegrationConnectionResponseDto>);
    if (dto.service === IntegrationService.METATRADER5) {
      response.apiToken = (dto.credentials as any).apiToken;
    }
    return response;
  }

  private async deployAsync(connectionId: string, dto: CreateIntegrationConnectionDto, provider: any) {
    try {
      const validation = await provider.validateCredentials(dto.credentials);

      if (!validation.valid) {
        throw new Error(validation.error as string);
      }

      await this.integrationRepo.update(connectionId, {
        status: DbIntegrationStatus.ACTIVE,
        externalAccountId: validation.accountId as string | undefined,
      });
      this.logger.log("Async deployment completed", { connectionId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error("Async deployment failed", { connectionId, error: message });
      await this.integrationRepo.update(connectionId, {
        status: DbIntegrationStatus.ERROR,
        lastSyncError: message,
      });
    }
  }

  async update(id: string, userId: string, dto: UpdateIntegrationConnectionDto): Promise<IntegrationConnectionResponseDto> {
    this.logger.debug("Updating integration connection", { id });

    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));

    let spaceIdToUpdate: string | null | undefined = undefined;
    if (dto.spaceId !== undefined) {
      if (dto.spaceId !== null) {
        const space = await prisma.space.findFirst({ where: { id: dto.spaceId, ownerId: userId } });
        if (!space) throw new NotFoundException(t("errors.SPACE_NOT_FOUND"));

        if (dto.spaceId !== connection.spaceId) {
          const limit = SERVICE_LIMITS[connection.service as IntegrationService];
          if (limit !== undefined) {
            const count = await this.integrationRepo.countBySpaceAndService(dto.spaceId, connection.service as IntegrationService);
            if (count >= limit) {
              throw new BadRequestException(t("errors.INTEGRATION_CONNECTION_LIMIT_REACHED", { service: connection.service, limit }));
            }
          }
        }
      }
      spaceIdToUpdate = dto.spaceId;
    }

    if (dto.credentials !== undefined) {
      dto.credentials = trimCredentials(dto.credentials as unknown as Record<string, unknown>) as any;
      const provider = this.providerFactory.get(connection.service as IntegrationService);
      const validation = await provider.validateCredentials(dto.credentials);
      if (!validation.valid) {
        throw new BadRequestException(
          t("errors.INTEGRATION_CREDENTIALS_INVALID", { service: connection.service, error: validation.error }),
        );
      }
    }

    const encryptedCredentials =
      dto.credentials !== undefined ? encryptCredentials(dto.credentials as unknown as Record<string, unknown>) : undefined;

    const updated = await this.integrationRepo.update(id, {
      name: dto.name,
      spaceId: spaceIdToUpdate,
      credentials: encryptedCredentials,
      status: dto.status as DbIntegrationStatus | undefined,
      syncInterval: dto.syncInterval,
      marketType: dto.marketType,
      externalAccountId: dto.externalAccountId,
      lastSyncError: dto.lastSyncError,
      consecutiveFailures: dto.consecutiveFailures,
    });

    this.logger.log("Integration connection updated", { connectionId: id });
    await this.cacheService.deletePattern(`trades_cache:${id}:*`);
    return new IntegrationConnectionResponseDto(updated as unknown as Partial<IntegrationConnectionResponseDto>);
  }

  async delete(id: string, userId: string): Promise<void> {
    this.logger.debug("Deleting integration connection", { id });

    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));

    await this.integrationRepo.delete(id);
    await this.cacheService.deletePattern(`trades_cache:${id}:*`);
    this.logger.log("Integration connection deleted", { connectionId: id });
  }

  private async ensureSpaceId(connection: any, userId: string): Promise<string> {
    if (connection.spaceId) return connection.spaceId;

    let defaultSpace =
      (await prisma.space.findFirst({
        where: { ownerId: userId, isDefault: true },
      })) ??
      (await prisma.space.findFirst({
        where: { ownerId: userId },
      }));

    if (!defaultSpace) {
      this.logger.log("No space found for user. Auto-initializing default space", { userId });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(t("errors.USER_NOT_FOUND"));
      }
      const initializedSpace = await this.initializeUserSpaceUseCase.initialize(userId, user.username);
      defaultSpace = await prisma.space.findUnique({ where: { id: initializedSpace.id } });
    }

    if (defaultSpace) {
      this.logger.log("Auto-healing missing spaceId for integration connection, linking to default space", {
        connectionId: connection.id,
        spaceId: defaultSpace.id,
      });
      await this.integrationRepo.update(connection.id as string, { spaceId: defaultSpace.id });
      connection.spaceId = defaultSpace.id;
      return defaultSpace.id;
    }

    throw new BadRequestException(t("errors.INTEGRATION_NOT_LINKED_TO_SPACE"));
  }

  async handleMT5Webhook(token: string, payload: MT5WebhookDto): Promise<{ success: boolean; imported: number; skipped: number }> {
    this.logger.debug("Received MT5 webhook payload", { connectionId: payload.connectionId });

    const connection = await this.integrationRepo.findById(payload.connectionId);
    if (!connection || connection.service !== IntegrationService.METATRADER5) {
      throw new UnprocessableEntityException("Invalid connection ID");
    }

    const credentials = decryptCredentials(connection.credentials as unknown as Record<string, string>);
    if (credentials.apiToken !== token) {
      throw new UnprocessableEntityException("Invalid token for this connection");
    }

    const spaceId = await this.ensureSpaceId(connection, connection.userId);
    const serviceLabel = this.getServiceLabel(connection.service as IntegrationService);

    const trades: TradeData[] = payload.trades.map((t) => ({
      sourcePositionId: t.sourcePositionId,
      symbol: t.symbol,
      direction: t.direction as "BUY" | "SELL",
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      quantity: t.quantity,
      grossPnL: t.grossPnL,
      fees: t.fees,
      netPnL: t.netPnL,
      openTime: t.openTime,
      closeTime: t.closeTime,
      currency: t.currency,
    }));

    if (trades.length > 0) {
      const persistResult = await this.syncRecordService.persistTrades(
        connection.userId as string,
        connection.id as string,
        serviceLabel,
        trades,
        spaceId,
      );

      let statusSignal: string | null = null;
      if (persistResult.noJournal) {
        statusSignal = "TRADING_JOURNAL_NOT_FOUND";
      } else if (persistResult.missingProperties.length > 0) {
        statusSignal = `MISSING_PROPERTIES:${persistResult.missingProperties.join(",")}`;
      }

      const updateData: Record<string, unknown> = { lastSyncAt: new Date() };
      if (statusSignal) {
        updateData.lastSyncError = statusSignal;
        if (statusSignal === "TRADING_JOURNAL_NOT_FOUND") {
          updateData.consecutiveFailures = ((connection.consecutiveFailures as number) ?? 0) + 1;
        }
      } else {
        updateData.lastSyncError = null;
        updateData.consecutiveFailures = 0;
      }

      await this.integrationRepo.update(connection.id as string, updateData as never);

      return { success: true, imported: persistResult.created, skipped: persistResult.skipped };
    }

    await this.integrationRepo.update(connection.id, { lastSyncAt: new Date(), lastSyncError: null, consecutiveFailures: 0 } as never);
    return { success: true, imported: 0, skipped: 0 };
  }

  async triggerSync(id: string, userId: string, opts?: { startDate?: string; endDate?: string }): Promise<SyncResult> {
    this.logger.debug("Triggering manual sync", { id });

    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));
    const spaceId = await this.ensureSpaceId(connection, userId);

    const prevError = connection.lastSyncError as string | null;
    const credentials = decryptCredentials(connection.credentials as unknown as Record<string, string>);
    const provider = this.providerFactory.get(connection.service as IntegrationService);
    const serviceLabel = this.getServiceLabel(connection.service as IntegrationService);

    const syncOpts: { startDate?: Date; endDate?: Date } = {};
    if (opts?.startDate) syncOpts.startDate = new Date(opts.startDate);
    if (opts?.endDate) syncOpts.endDate = new Date(opts.endDate);

    const result = await provider.sync(id, credentials, syncOpts);

    if (result.errors.length > 0 && connection.status !== DbIntegrationStatus.ERROR) {
      await this.notificationService.create(
        userId,
        NotificationType.INTEGRATION,
        t("notifications.integration_failed", { service: serviceLabel }),
        "/settings",
      );
      await this.integrationRepo.update(id, { status: DbIntegrationStatus.ERROR, lastSyncError: result.errors[0] });
    }

    let statusSignal: string | null = null;

    if (result.trades && result.trades.length > 0) {
      const persistResult = await this.syncRecordService.persistTrades(userId, id, serviceLabel, result.trades, spaceId);
      this.logger.debug("Trades persisted to Trading Journal", { ...persistResult });

      if (persistResult.noJournal) {
        statusSignal = "TRADING_JOURNAL_NOT_FOUND";
      } else if (persistResult.missingProperties.length > 0) {
        statusSignal = `MISSING_PROPERTIES:${persistResult.missingProperties.join(",")}`;
      }
    }

    if (statusSignal && statusSignal !== prevError) {
      if (statusSignal === "TRADING_JOURNAL_NOT_FOUND") {
        await this.notificationService.create(
          userId,
          NotificationType.INTEGRATION,
          t("notifications.integration_no_journal", { service: serviceLabel }),
          "/settings",
        );
      } else {
        const properties = statusSignal.replace("MISSING_PROPERTIES:", "");
        await this.notificationService.create(
          userId,
          NotificationType.INTEGRATION,
          t("notifications.integration_missing_properties", { service: serviceLabel, properties }),
          "/settings",
        );
      }
    }

    const updateData: Record<string, unknown> = { lastSyncAt: new Date() };
    if (result.errors.length > 0) {
      updateData.lastSyncError = result.errors.join("; ");
      updateData.consecutiveFailures = (connection.consecutiveFailures ?? 0) + 1;
    } else if (statusSignal === "TRADING_JOURNAL_NOT_FOUND") {
      updateData.lastSyncError = statusSignal;
      updateData.consecutiveFailures = (connection.consecutiveFailures ?? 0) + 1;
    } else if (statusSignal) {
      updateData.lastSyncError = statusSignal;
    } else {
      updateData.lastSyncError = null;
      updateData.consecutiveFailures = 0;
    }

    await this.integrationRepo.update(id, updateData as never);
    this.logger.log("Manual sync completed", { connectionId: id, synced: result.synced, skipped: result.skipped });

    return result;
  }

  async previewTrades(id: string, userId: string, dto: PreviewTradesDto): Promise<PreviewTradesResponseDto> {
    this.logger.debug("Previewing trades", { id });

    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));
    const spaceId = await this.ensureSpaceId(connection, userId);

    if (connection.service === IntegrationService.METATRADER5) {
      const records = await this.recordRepo.findManyWithValuesBySourceIntegration(id);

      const mappedTrades: TradeData[] = records.map((record) => {
        const getVal = (key: string): any => {
          const valObj = record.values.find((v) => v.property.integrationKey === key);
          return valObj ? valObj.value : undefined;
        };

        const dirVal = getVal("direction");
        const direction: "BUY" | "SELL" = dirVal === "Long" ? "BUY" : "SELL";

        const entryPrice = Number(getVal("entryPrice") ?? 0);
        const exitPrice = Number(getVal("exitPrice") ?? 0);
        const quantity = Number(getVal("quantity") ?? 0);
        const fees = Number(getVal("fees") ?? 0);

        const openTime = getVal("entryDate") ? new Date(getVal("entryDate") as string).toISOString() : record.createdAt.toISOString();
        const closeTime = getVal("exitDate") ? new Date(getVal("exitDate") as string).toISOString() : record.createdAt.toISOString();

        const netPnL = (exitPrice - entryPrice) * quantity * (direction === "BUY" ? 1 : -1) - fees;
        const grossPnL = netPnL + fees;

        return {
          sourcePositionId: record.sourcePositionId ?? record.id,
          symbol: getVal("pair") ?? record.name.split(" ")[0] ?? "Unknown",
          direction,
          entryPrice,
          exitPrice,
          quantity,
          grossPnL,
          fees,
          netPnL,
          openTime,
          closeTime,
          currency: record.sourceCurrency ?? "USD",
          stopLoss: getVal("stopLoss") ? Number(getVal("stopLoss")) : undefined,
          takeProfit: getVal("takeProfit") ? Number(getVal("takeProfit")) : undefined,
        };
      });

      const start = new Date(dto.startDate).getTime();
      const end = new Date(dto.endDate).getTime();

      const filteredTrades = mappedTrades.filter((trade) => {
        const tTime = new Date(trade.closeTime).getTime();
        return tTime >= start && tTime <= end;
      });

      const annotated = filteredTrades.map((t) => ({ ...t, alreadyImported: true }));

      const tradeDtos: IntegrationTradeDto[] = annotated.map((trade) => ({
        sourcePositionId: trade.sourcePositionId,
        symbol: trade.symbol,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        grossPnL: trade.grossPnL,
        fees: trade.fees,
        netPnL: trade.netPnL,
        openTime: trade.openTime,
        closeTime: trade.closeTime,
        currency: trade.currency,
        alreadyImported: trade.alreadyImported,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
      }));

      const journalDatabaseId = await this.syncRecordService.findJournalDatabaseId(spaceId);

      return {
        trades: tradeDtos,
        journalDatabaseId,
      };
    }

    const cacheKey = this.cacheService.generateTradeCacheKey(id, dto.startDate, dto.endDate);
    let trades = await this.cacheService.get<TradeData[]>(cacheKey);

    if (!trades) {
      const credentials = decryptCredentials(connection.credentials as unknown as Record<string, string>);
      const provider = this.providerFactory.get(connection.service as IntegrationService);

      const result = await provider.sync(id, credentials, {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });

      if (result.errors.length > 0) {
        throw new UnprocessableEntityException(result.errors[0]);
      }

      trades = result.trades ?? [];
      await this.cacheService.set(cacheKey, trades, 900);
    }

    const annotated = await this.syncRecordService.annotateExisting(id, trades);
    const tradeDtos: IntegrationTradeDto[] = annotated.map((trade) => ({
      sourcePositionId: trade.sourcePositionId,
      symbol: trade.symbol,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      grossPnL: trade.grossPnL,
      fees: trade.fees,
      netPnL: trade.netPnL,
      openTime: trade.openTime,
      closeTime: trade.closeTime,
      currency: trade.currency,
      alreadyImported: trade.alreadyImported,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
    }));

    const journalDatabaseId = await this.syncRecordService.findJournalDatabaseId(spaceId);

    return {
      trades: tradeDtos,
      journalDatabaseId,
    };
  }

  async importTrades(id: string, userId: string, dto: ImportTradesDto): Promise<{ created: number; skipped: number }> {
    this.logger.debug("Importing selected trades", { id, count: dto.sourcePositionIds.length });

    const connection = await this.integrationRepo.findByOwner(id, userId);
    if (!connection) throw new NotFoundException(t("errors.INTEGRATION_CONNECTION_NOT_FOUND"));
    if (connection.service === IntegrationService.METATRADER5) {
      return { created: 0, skipped: dto.sourcePositionIds.length };
    }
    const spaceId = await this.ensureSpaceId(connection, userId);

    const cacheKey = this.cacheService.generateTradeCacheKey(id, dto.startDate, dto.endDate);
    let trades = await this.cacheService.get<TradeData[]>(cacheKey);

    if (!trades) {
      const credentials = decryptCredentials(connection.credentials as unknown as Record<string, string>);
      const provider = this.providerFactory.get(connection.service as IntegrationService);

      const result = await provider.sync(id, credentials, {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });
      trades = result.trades ?? [];
    }

    const selectedIds = new Set(dto.sourcePositionIds);
    const filtered = trades.filter((trade) => selectedIds.has(trade.sourcePositionId));

    const serviceLabel = this.getServiceLabel(connection.service as IntegrationService);
    const persistResult = await this.syncRecordService.persistTrades(userId, id, serviceLabel, filtered, spaceId);

    if (dto.templateId && persistResult.createdRecordIds.length > 0) {
      await Promise.all(persistResult.createdRecordIds.map((recordId) => this.recordService.applyTemplate(recordId, dto.templateId!)));
    }

    return { created: persistResult.created, skipped: persistResult.skipped };
  }

  private getServiceLabel(service: IntegrationService): string {
    switch (service) {
      case IntegrationService.BINANCE:
        return "Binance";
      case IntegrationService.METATRADER5:
        return "MetaTrader 5";
      default:
        return service;
    }
  }
}

function trimCredentials(credentials: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === "string") {
      result[key] = value.trim();
    } else {
      result[key] = value;
    }
  }
  return result;
}
