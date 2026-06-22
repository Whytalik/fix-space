import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { Prisma } from "@fixspace/database";
import { CreateRecordDto, RecordResponseDto, UpdateRecordDto } from "@fixspace/domain";

import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { generateUniqueName } from "@/common/utils/generate-unique-name";

import { SettingsCategory } from "@fixspace/domain";
import { SettingsService } from "@/modules/settings/settings.service";
import { FormulaRecalculator } from "@/modules/property/types/formula/formula-recalculator.service";
import { RecordContentService } from "@/modules/record-content/record-content.service";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { TemplateRepository } from "@/modules/template/repositories/template.repository";
import { ViewRepository } from "@/modules/view/repositories/view.repository";
import { RecordRepository } from "./repositories/record.repository";
import { toRecordResponseDto } from "./utils/to-record-response.util";
import { parseNamePattern } from "./utils/name-pattern-parser.util";
import { normalizeContentSchema, hasContentRows } from "./utils/content-schema.util";

@Injectable()
export class RecordService {
  constructor(
    private readonly logger: AppLogger,
    private readonly eventEmitter: EventEmitter2,
    private readonly settingsService: SettingsService,
    private readonly formulaRecalculator: FormulaRecalculator,
    private readonly recordRepo: RecordRepository,
    private readonly recordContentService: RecordContentService,
    private readonly viewRepo: ViewRepository,
    private readonly databaseRepo: DatabaseRepository,
    private readonly propertyRepo: PropertyRepository,
    private readonly templateRepo: TemplateRepository,
  ) {
    this.logger.setContext(RecordService.name);
  }

  async create(
    databaseId: string,
    createRecordDto: CreateRecordDto,
    userId: string,
    options?: { skipAutomations?: boolean },
  ): Promise<RecordResponseDto> {
    this.logger.debug("Creating record", { databaseId, viewId: createRecordDto.viewId });

    const database = await this.databaseRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND_ID", { id: databaseId }));
    }

    const properties = await this.propertyRepo.findManyByDatabase(databaseId);

    const view = createRecordDto.viewId ? await this.viewRepo.findById(createRecordDto.viewId) : null;

    let capturedTemplateContent: unknown = null;

    const result = await this.recordRepo.transaction(async (transaction) => {
      let templateId = createRecordDto.templateId;
      let recordIcon = createRecordDto.icon;

      this.logger.debug("Starting transaction for record creation", { templateId, providedName: createRecordDto.name });

      if (templateId === undefined) {
        if (view?.useDefaultTemplate && view.defaultTemplateId) {
          templateId = view.defaultTemplateId;
          this.logger.debug("Resolved template from view default", { templateId });
        } else if (view?.useDefaultTemplate !== false) {
          const defaultTemplate = await this.templateRepo.findDefaultInDatabase(databaseId, transaction);
          if (defaultTemplate) {
            templateId = defaultTemplate.id;
            this.logger.debug("Resolved template from database default", { templateId });
          }
        }
      }

      const templateValues: Record<string, unknown> = {};
      let recordName = createRecordDto.name;

      if (templateId) {
        const template = await transaction.template.findFirst({
          where: {
            id: templateId,
            databaseId,
          },
          include: {
            values: true,
          },
        });

        if (!template) {
          throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
        }

        if (!recordIcon && template.icon) {
          recordIcon = template.icon;
        }

        let patternToUse = template.namePattern;
        if (!patternToUse && template.name?.includes("{{")) {
          patternToUse = template.name;
        }

        if (patternToUse && (!recordName || recordName === "Untitled" || recordName === "Без назви")) {
          recordName = await parseNamePattern(patternToUse, databaseId, transaction);
        }

        for (const templateValue of template.values) {
          if (templateValue.value !== undefined && templateValue.value !== null) {
            templateValues[templateValue.propertyId] = templateValue.value;
          }
        }

        capturedTemplateContent = template.content;
      }

      const { icon: effectiveIcon } = await this.settingsService.resolveDefaults(userId, SettingsCategory.RECORD, {
        icon: recordIcon,
      });

      const record = await this.recordRepo.create(
        {
          databaseId,
          name: recordName,
          icon: effectiveIcon,
          templateId: templateId,
        },
        transaction,
      );

      for (const property of properties) {
        const templateValue = templateValues[property.id];
        const value = templateValue !== undefined ? templateValue : Prisma.DbNull;

        await transaction.propertyValue.create({
          data: {
            recordId: record.id,
            propertyId: property.id,
            value: value as Prisma.InputJsonValue,
            computed: false,
          },
        });
      }

      await this.formulaRecalculator.recalculate(record.id, databaseId, transaction);

      this.logger.log("Record created", {
        recordId: record.id,
        databaseId,
        templateId: templateId,
      });

      const createdRecord = await this.recordRepo.findUniqueOrThrowWithValues(record.id, transaction);
      return toRecordResponseDto(createdRecord);
    });

    if (hasContentRows(capturedTemplateContent)) {
      await this.recordContentService.update(result.id, { content: normalizeContentSchema(capturedTemplateContent) });
    }

    if (!options?.skipAutomations) {
      await this.eventEmitter.emitAsync("automation.recordCreated", { record: result, userId });
    }

    return result;
  }

  async findAll(databaseId: string, userId: string): Promise<RecordResponseDto[]> {
    this.logger.debug("Finding all records", { databaseId });
    const records = await this.recordRepo.findAllByDatabase(databaseId, userId);
    return records.map(toRecordResponseDto);
  }

  async findAllPaged(
    databaseId: string,
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: RecordResponseDto[]; total: number; page: number; pageSize: number }> {
    if (page < 1 || pageSize < 1) {
      throw new BadRequestException(t("errors.PAGE_PAGE_SIZE_MUST_BE_POSITIVE"));
    }

    this.logger.debug("Finding paged records", { databaseId, page, pageSize });

    const [records, total] = await this.recordRepo.findPagedByDatabase(databaseId, userId, (page - 1) * pageSize, pageSize);

    return {
      data: records.map(toRecordResponseDto),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<RecordResponseDto> {
    this.logger.debug("Finding record", { id });

    const record = await this.recordRepo.findById(id);

    if (!record) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id }));
    }

    return toRecordResponseDto(record);
  }

  async update(id: string, updateRecordDto: UpdateRecordDto): Promise<RecordResponseDto> {
    this.logger.debug("Updating record", { id });

    const existingRecord = await this.recordRepo.findById(id);

    if (!existingRecord) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id }));
    }

    const updateData = filterUndefined({
      fields: {
        name: updateRecordDto.name,
        icon: updateRecordDto.icon,
      },
    });

    const record = await this.recordRepo.update(id, updateData);

    this.logger.log("Record updated", { id });
    return toRecordResponseDto(record);
  }

  async remove(id: string): Promise<RecordResponseDto> {
    this.logger.debug("Removing record", { id });

    const existingRecord = await this.recordRepo.findById(id);

    if (!existingRecord) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id }));
    }

    const record = await this.recordRepo.delete(id);

    this.logger.log("Record removed", { id });
    return toRecordResponseDto(record);
  }

  async applyTemplate(id: string, templateId: string): Promise<RecordResponseDto> {
    this.logger.debug("Applying template to record", { recordId: id, templateId });

    const record = await this.recordRepo.findById(id);
    if (!record) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id }));
    }

    let capturedTemplateContent: unknown = null;

    const result = await this.recordRepo.transaction(async (transaction) => {
      const template = await transaction.template.findFirst({
        where: { id: templateId, databaseId: record.databaseId },
        include: { values: true },
      });

      if (!template) {
        throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
      }

      capturedTemplateContent = template.content;

      let recordName = record.name;
      if (template.namePattern && (!recordName || recordName === "Untitled" || recordName === "Без назви")) {
        recordName = await parseNamePattern(template.namePattern, record.databaseId, transaction);
      }

      let recordIcon = record.icon;
      if (template.icon) {
        recordIcon = template.icon;
      }

      for (const templateValue of template.values) {
        if (templateValue.value !== undefined && templateValue.value !== null) {
          await transaction.propertyValue.upsert({
            where: {
              recordId_propertyId: {
                recordId: id,
                propertyId: templateValue.propertyId,
              },
            },
            update: {
              value: templateValue.value as Prisma.InputJsonValue,
            },
            create: {
              recordId: id,
              propertyId: templateValue.propertyId,
              value: templateValue.value as Prisma.InputJsonValue,
            },
          });
        }
      }

      await transaction.record.update({
        where: { id },
        data: {
          templateId,
          name: recordName,
          icon: recordIcon,
        },
      });

      await this.formulaRecalculator.recalculate(id, record.databaseId, transaction);

      if (capturedTemplateContent) {
        await this.recordContentService.update(id, {
          content: normalizeContentSchema(capturedTemplateContent),
        });
      }

      this.logger.log("Template applied", { recordId: id, templateId });
      const updated = await this.recordRepo.findUniqueOrThrowWithValues(id, transaction);
      return toRecordResponseDto(updated);
    });

    return result;
  }

  async duplicate(id: string): Promise<RecordResponseDto> {
    this.logger.debug("Duplicating record", { id });

    const source = await this.recordRepo.findById(id);

    if (!source) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id }));
    }

    return this.recordRepo.transaction(async (transaction) => {
      const newRecord = await this.recordRepo.create(
        {
          databaseId: source.databaseId,
          name: generateUniqueName(source.name),
          icon: source.icon ?? undefined,
        },
        transaction,
      );

      for (const propertyValue of source.values) {
        await transaction.propertyValue.create({
          data: {
            recordId: newRecord.id,
            propertyId: propertyValue.propertyId,
            value: propertyValue.value as Prisma.InputJsonValue,
            computed: propertyValue.computed,
          },
        });
      }

      await this.formulaRecalculator.recalculate(newRecord.id, source.databaseId, transaction);

      this.logger.log("Record duplicated", { sourceId: id, newId: newRecord.id });

      const created = await this.recordRepo.findUniqueOrThrowWithValues(newRecord.id, transaction);
      return toRecordResponseDto(created);
    });
  }
}
