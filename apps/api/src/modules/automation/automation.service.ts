import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { I18nService } from "nestjs-i18n";

import { NotificationType, Prisma } from "@fixspace/database";
import {
  AutomationAction,
  AutomationActionType,
  AutomationFilterDto,
  AutomationLogResponseDto,
  AutomationResponseDto,
  AutomationStatus,
  AutomationTrigger,
  AutomationWriteMode,
  CreateAutomationDto,
  LinkRecordsAction,
  UpdateAutomationDto,
} from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyValueService } from "@/modules/property-value/property-value.service";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { RecordService } from "@/modules/record/record.service";
import { NotificationService } from "@/modules/notification/notification.service";

import { AutomationEngine, RecordForAutomation } from "./automation.engine";
import { AutomationScheduler, AutomationScheduledEvent, ScheduleConfig } from "./automation.scheduler";
import { AutomationRepository } from "./repositories/automation.repository";

export interface AutomationRecordCreatedEvent {
  record: RecordForAutomation;
  userId: string;
  skipAutomations?: boolean;
}

export interface AutomationFieldChangedEvent {
  recordId: string;
  databaseId: string;
  propertyId: string;
  oldValue: unknown;
  newValue: unknown;
  userId: string;
  skipAutomations?: boolean;
}

interface ActionResult {
  skipped: boolean;
  message: string;
  link?: string;
}

@Injectable()
export class AutomationService {
  constructor(
    private readonly logger: AppLogger,
    private readonly automationRepo: AutomationRepository,
    private readonly automationEngine: AutomationEngine,
    private readonly propertyValueService: PropertyValueService,
    private readonly recordService: RecordService,
    private readonly scheduler: AutomationScheduler,
    private readonly notificationService: NotificationService,
    private readonly databaseRepo: DatabaseRepository,
    private readonly recordRepo: RecordRepository,
    private readonly i18nService: I18nService,
  ) {
    this.logger.setContext(AutomationService.name);
  }

  async create(dto: CreateAutomationDto, userId: string): Promise<AutomationResponseDto> {
    this.logger.debug("Creating automation", { databaseId: dto.databaseId, name: dto.name });

    const database = await this.databaseRepo.findDatabaseByOwner(dto.databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const count = await this.automationRepo.countByDatabase(dto.databaseId);
    if (count >= 10) throw new BadRequestException(t("errors.AUTOMATION_LIMIT_EXCEEDED"));

    const isActive = dto.active ?? true;
    const entity = await this.automationRepo.create({
      databaseId: dto.databaseId,
      name: dto.name,
      trigger: dto.trigger,
      actions: dto.actions as unknown as Prisma.InputJsonValue,
      active: isActive,
      config: (dto.config ?? Prisma.DbNull) as Prisma.InputJsonValue,
    });

    if (dto.trigger === AutomationTrigger.ON_SCHEDULE && isActive && dto.config) {
      this.scheduler.registerJob(entity.id, dto.config as unknown as ScheduleConfig);
    }

    this.logger.log("Automation created", { automationId: entity.id });
    return new AutomationResponseDto(entity as unknown as Partial<AutomationResponseDto>);
  }

  async findAll(databaseId: string, userId: string): Promise<AutomationResponseDto[]> {
    this.logger.debug("Finding automations", { databaseId });

    const database = await this.databaseRepo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const entities = await this.automationRepo.findAllByDatabase(databaseId);
    return entities.map((entity) => new AutomationResponseDto(entity as unknown as Partial<AutomationResponseDto>));
  }

  async findOne(id: string, userId?: string): Promise<AutomationResponseDto> {
    this.logger.debug("Finding automation", { id });

    const entity = userId ? await this.automationRepo.findByOwner(id, userId) : await this.automationRepo.findById(id);

    if (!entity) throw new NotFoundException(t("errors.AUTOMATION_NOT_FOUND"));
    return new AutomationResponseDto(entity as unknown as Partial<AutomationResponseDto>);
  }

  async update(id: string, dto: UpdateAutomationDto, userId: string): Promise<AutomationResponseDto> {
    this.logger.debug("Updating automation", { id });

    const exists = await this.automationRepo.findByOwner(id, userId);
    if (!exists) throw new NotFoundException(t("errors.AUTOMATION_NOT_FOUND"));

    const updateData = filterUndefined({
      fields: { name: dto.name, trigger: dto.trigger, active: dto.active },
      jsonFields: {
        actions: dto.actions,
        config: dto.config,
      },
    });

    const entity = await this.automationRepo.update(id, updateData);

    const isSchedule = (dto.trigger ?? exists.trigger) === AutomationTrigger.ON_SCHEDULE;
    const isActive = dto.active ?? exists.active;
    if (isSchedule && isActive) {
      const configRaw = dto.config ?? exists.config;
      if (configRaw) this.scheduler.registerJob(entity.id, configRaw as unknown as ScheduleConfig);
    } else {
      this.scheduler.removeJob(entity.id);
    }

    this.logger.log("Automation updated", { automationId: entity.id });
    return new AutomationResponseDto(entity as unknown as Partial<AutomationResponseDto>);
  }

  async delete(id: string, userId: string): Promise<void> {
    this.logger.debug("Deleting automation", { id });

    const exists = await this.automationRepo.findByOwner(id, userId);
    if (!exists) throw new NotFoundException(t("errors.AUTOMATION_NOT_FOUND"));

    this.scheduler.removeJob(id);
    await this.automationRepo.delete(id);
    this.logger.log("Automation deleted", { id });
  }

  async getLogs(id: string, userId: string): Promise<AutomationLogResponseDto[]> {
    this.logger.debug("Getting automation logs", { id });

    const exists = await this.automationRepo.findByOwner(id, userId);
    if (!exists) throw new NotFoundException(t("errors.AUTOMATION_NOT_FOUND"));

    const logs = await this.automationRepo.findLogsByAutomation(id);
    return logs.map((log) => new AutomationLogResponseDto(log as unknown as Partial<AutomationLogResponseDto>));
  }

  async testRun(id: string, recordId: string, userId: string): Promise<{ results: string[]; status: AutomationStatus }> {
    this.logger.debug("Test-running automation", { id, recordId });

    const automation = await this.automationRepo.findByOwner(id, userId);
    if (!automation) throw new NotFoundException(t("errors.AUTOMATION_NOT_FOUND"));

    const record = await this.recordRepo.findById(recordId);
    if (!record) throw new NotFoundException(t("errors.RECORD_NOT_FOUND"));

    const actions = (automation.actions as unknown as AutomationAction[]) || [];
    const results: string[] = [];

    for (const action of actions) {
      results.push(this.previewAction(action, record, userId));
    }

    return { results, status: AutomationStatus.SUCCESS };
  }

  @OnEvent("automation.recordCreated", { async: true })
  async onRecordCreated(event: AutomationRecordCreatedEvent): Promise<void> {
    if (event.skipAutomations) return;
    this.logger.debug("Handling recordCreated event", { recordId: event.record.id, databaseId: event.record.databaseId });

    const automations = await this.automationRepo.findAllByDatabase(event.record.databaseId);
    const active = automations.filter((automation) => automation.active && automation.trigger === AutomationTrigger.ON_RECORD_CREATE);
    const executedAutomations = new Set<string>();

    for (const automation of active) {
      await this.runAutomation(automation, event.record, event.userId, executedAutomations);
    }
  }

  @OnEvent("automation.fieldChanged", { async: true })
  async onFieldChanged(event: AutomationFieldChangedEvent): Promise<void> {
    if (event.skipAutomations) return;
    this.logger.debug("Handling fieldChanged event", { recordId: event.recordId, propertyId: event.propertyId });

    const record = await this.recordRepo.findById(event.recordId);
    if (!record) return;

    const automations = await this.automationRepo.findAllByDatabase(event.databaseId);
    const active = automations.filter((automation) => automation.active && automation.trigger === AutomationTrigger.ON_FIELD_CHANGE);
    const executedAutomations = new Set<string>();

    for (const automation of active) {
      const raw = automation.config as { propertyId?: string; condition?: { type: string; value?: unknown } } | null;
      if (!raw?.propertyId) continue;
      const config = raw as { propertyId: string; condition?: { type: string; value?: unknown } };
      const conditionMet = this.automationEngine.evaluateFieldChangeCondition(config, event.propertyId, event.oldValue, event.newValue);
      if (!conditionMet) continue;
      await this.runAutomation(automation, record, event.userId, executedAutomations);
    }
  }

  @OnEvent("automation.scheduled", { async: true })
  async onScheduled(event: AutomationScheduledEvent): Promise<void> {
    this.logger.debug("Handling scheduled automation event", { automationId: event.automationId });
    await this.runScheduledAutomation(event.automationId);
  }

  async runScheduledAutomation(automationId: string): Promise<void> {
    const automation = await this.automationRepo.findById(automationId);
    if (!automation?.active) return;

    const database = await this.databaseRepo.findWithSpace(automation.databaseId);
    if (!database) {
      try {
        await this.automationRepo.createLog({
          automationId,
          sourceRecordId: null,
          status: AutomationStatus.SKIPPED,
          result: "skipped: database not found",
        });
      } catch (err) {
        this.logger.warn("Could not create automation log (possibly parent automation was deleted)", {
          automationId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
      return;
    }

    const userId = database.space.ownerId;
    const dummyRecord: RecordForAutomation = { id: "", databaseId: automation.databaseId };
    const actions = (automation.actions as unknown as AutomationAction[]) || [];
    const results: string[] = [];
    let status: AutomationStatus = AutomationStatus.SUCCESS;
    let notificationLink: string | undefined;

    try {
      for (const action of actions.slice(0, 5)) {
        if (action.type !== AutomationActionType.CREATE_RECORD) {
          results.push(`skipped: action type ${action.type} not supported for ON_SCHEDULE`);
          status = AutomationStatus.SKIPPED;
          continue;
        }
        const result = await this.executeAction(action, dummyRecord, userId);
        results.push(result.message);
        if (result.link && !notificationLink) notificationLink = result.link;
        if (result.skipped) {
          status = AutomationStatus.SKIPPED;
          break;
        }
      }
    } catch (err: unknown) {
      status = AutomationStatus.FAILURE;
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.push(`Error: ${errorMessage}`);
      this.logger.error("Scheduled automation action failed", { automationId, error: errorMessage });
    }

    try {
      await this.automationRepo.createLog({
        automationId,
        sourceRecordId: null,
        status,
        result: results.join("; "),
      });
    } catch (err) {
      this.logger.warn("Could not create automation log (possibly parent automation was deleted)", {
        automationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await this.sendAutomationNotification(userId, automation.name, status, notificationLink);
    this.logger.log("Scheduled automation run completed", { automationId, status });
  }

  private async runAutomation(
    automation: { id: string; name: string; actions: unknown; trigger: string },
    record: RecordForAutomation,
    userId: string,
    executedAutomations: Set<string>,
  ): Promise<void> {
    if (executedAutomations.has(automation.id)) {
      this.logger.warn("Recursion guard: automation already executed in this chain", { automationId: automation.id });
      return;
    }
    executedAutomations.add(automation.id);

    const actions = (automation.actions as unknown as AutomationAction[]) || [];
    const results: string[] = [];
    let status: AutomationStatus = AutomationStatus.SUCCESS;
    let notificationLink: string | undefined;

    try {
      for (const action of actions.slice(0, 5)) {
        const result = await this.executeAction(action, record, userId);
        results.push(result.message);
        if (result.link && !notificationLink) notificationLink = result.link;
        if (result.skipped) {
          status = AutomationStatus.SKIPPED;
          break;
        }
      }
    } catch (err: unknown) {
      status = AutomationStatus.FAILURE;
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.push(`Error: ${errorMessage}`);
      this.logger.error("Automation action failed", { automationId: automation.id, error: errorMessage });
    }

    try {
      await this.automationRepo.createLog({
        automationId: automation.id,
        sourceRecordId: record.id,
        status,
        result: results.join("; "),
      });
    } catch (err) {
      this.logger.warn("Could not create automation log (possibly parent automation was deleted)", {
        automationId: automation.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await this.sendAutomationNotification(userId, automation.name, status, notificationLink);
    this.logger.log("Automation run completed", { automationId: automation.id, status });
  }

  private async executeAction(action: AutomationAction, record: RecordForAutomation, userId: string): Promise<ActionResult> {
    switch (action.type) {
      case AutomationActionType.SET_FIELD_VALUE:
        return this.executeSetFieldValue(action, record, userId);
      case AutomationActionType.CREATE_RECORD:
        return this.executeCreateRecord(action, record, userId);
      case AutomationActionType.LINK_RECORDS:
        return this.executeLinkRecords(action, record, userId);
      default:
        return { skipped: false, message: `Unknown action type` };
    }
  }

  private async executeSetFieldValue(
    action: { propertyId: string; valueType: string; value?: unknown; fieldRef?: string },
    record: RecordForAutomation,
    userId: string,
  ): Promise<ActionResult> {
    const resolvedValue = this.automationEngine.resolveValue(action, record);
    await this.propertyValueService.create(
      record.id,
      { recordId: record.id, propertyId: action.propertyId, value: resolvedValue },
      userId,
      { skipAutomations: true },
    );
    return { skipped: false, message: `set property "${action.propertyId}" = ${JSON.stringify(resolvedValue)}` };
  }

  private async getDbDisplayName(databaseId: string): Promise<string> {
    const dbName = (await this.databaseRepo.findById(databaseId))?.name ?? null;
    return dbName ?? databaseId;
  }

  private async executeCreateRecord(
    action: {
      databaseId: string;
      fieldMappings: Array<{ targetPropertyId: string; valueType: string; value?: unknown; fieldRef?: string }>;
    },
    record: RecordForAutomation,
    userId: string,
  ): Promise<ActionResult> {
    const dbDisplay = await this.getDbDisplayName(action.databaseId);
    const newRecord = await this.recordService.create(action.databaseId, { databaseId: action.databaseId, name: "Untitled" }, userId, {
      skipAutomations: true,
    });
    try {
      for (const mapping of action.fieldMappings ?? []) {
        const resolvedValue = this.automationEngine.resolveValue(mapping, record);
        if (resolvedValue !== null && resolvedValue !== undefined) {
          await this.propertyValueService.create(
            newRecord.id,
            { recordId: newRecord.id, propertyId: mapping.targetPropertyId, value: resolvedValue },
            userId,
            { skipAutomations: true },
          );
        }
      }
    } catch (error) {
      await this.recordRepo.delete(newRecord.id).catch((deleteError: unknown) => {
        this.logger.warn("Could not roll back partially created record", {
          recordId: newRecord.id,
          error: deleteError instanceof Error ? deleteError.message : String(deleteError),
        });
      });
      throw error;
    }
    return { skipped: false, message: `created record in database "${dbDisplay}"`, link: `/database/${action.databaseId}` };
  }

  private async executeLinkRecords(
    action: { propertyId: string; sourceDatabaseId: string; filters: AutomationFilterDto[]; writeMode: string },
    record: RecordForAutomation,
    userId: string,
  ): Promise<ActionResult> {
    const dbDisplay = await this.getDbDisplayName(action.sourceDatabaseId);
    const filters = action.filters ?? [];

    if (this.automationEngine.shouldSkipFilters(filters, record)) {
      return { skipped: true, message: `skipped: a referenced filter field is empty` };
    }

    const candidates = await this.recordRepo.findManyByDatabase(action.sourceDatabaseId);
    const matched = candidates.filter((candidate) => this.automationEngine.matchesFilters(candidate, filters, record));
    const matchedIds = matched.map((matchedRecord) => matchedRecord.id);

    let finalIds: string[];
    if (action.writeMode === AutomationWriteMode.APPEND) {
      const existing = (this.automationEngine.getRecordValue(record, action.propertyId) as string[] | null) ?? [];
      finalIds = [...new Set([...existing, ...matchedIds])];
    } else {
      finalIds = matchedIds;
    }

    await this.propertyValueService.create(record.id, { recordId: record.id, propertyId: action.propertyId, value: finalIds }, userId, {
      skipAutomations: true,
    });

    return { skipped: false, message: `linked ${matchedIds.length} record(s) from "${dbDisplay}" to property "${action.propertyId}"` };
  }

  private async sendAutomationNotification(userId: string, automationName: string, status: AutomationStatus, link?: string): Promise<void> {
    const notificationType = status === AutomationStatus.FAILURE ? NotificationType.ERROR : NotificationType.AUTOMATION;
    const key =
      status === AutomationStatus.SUCCESS
        ? "notifications.automation_success"
        : status === AutomationStatus.FAILURE
          ? "notifications.automation_failure"
          : "notifications.automation_skipped";

    const text = this.i18nService.t(key, { lang: "en", args: { name: automationName } });

    try {
      await this.notificationService.create(userId, notificationType, text, link);
    } catch (err: unknown) {
      this.logger.warn("Failed to send automation notification", { userId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  private previewAction(action: AutomationAction, record: RecordForAutomation, _userId: string): string {
    switch (action.type) {
      case AutomationActionType.SET_FIELD_VALUE: {
        const resolvedValue = this.automationEngine.resolveValue(action, record);
        return `would set property "${action.propertyId}" = ${JSON.stringify(resolvedValue)}`;
      }
      case AutomationActionType.CREATE_RECORD:
        return `would create record in database "${action.databaseId}"`;
      case AutomationActionType.LINK_RECORDS: {
        const linkAction = action as LinkRecordsAction;
        const filters = linkAction.filters ?? [];
        if (this.automationEngine.shouldSkipFilters(filters, record)) {
          return `would skip: a referenced filter field is empty`;
        }
        return `would search and link records from database "${linkAction.sourceDatabaseId}"`;
      }
      default:
        return `unknown action`;
    }
  }
}
