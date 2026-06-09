import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateRecordDto, RecordResponseDto, UpdateRecordDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { generateUniqueName } from "@/common/utils/generate-unique-name";
import { SettingsCategory } from "@/modules/settings/constants/settings.constants";
import { SettingsService } from "@/modules/settings/settings.service";
import { RecordRepository } from "./repositories/record.repository";
import { toRecordResponseDto } from "./utils/to-record-response.util";
import { parseNamePattern } from "./utils/name-pattern-parser.util";

@Injectable()
export class RecordService {
  constructor(
    private readonly logger: AppLogger,
    private readonly settingsService: SettingsService,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(RecordService.name);
  }

  async create(databaseId: string, createRecordDto: CreateRecordDto, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Creating record", { databaseId, viewId: createRecordDto.viewId });

    const database = await this.recordRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    let view: any = null;
    if (createRecordDto.viewId) {
      view = await this.recordRepo.transaction((tx) =>
        tx.view.findFirst({
          where: { id: createRecordDto.viewId, databaseId },
        }),
      );
      if (!view) {
        throw new NotFoundException(t("errors.VIEW_NOT_FOUND"));
      }
    }

    const recordLimit = view?.recordLimit;
    if (recordLimit) {
      const count = await this.recordRepo.countByDatabase(databaseId);
      if (count >= recordLimit) {
        throw new BadRequestException(t("errors.RECORD_LIMIT_REACHED"));
      }
    }

    const effectiveIcon = createRecordDto.icon ?? (await this.settingsService.getDefaultIcon(userId, SettingsCategory.RECORD));

    const properties = await this.recordRepo.findPropertiesByDatabase(databaseId);

    return await this.recordRepo.transaction(async (transaction) => {
      let templateId = createRecordDto.templateId;

      if (!templateId) {
        if (view?.useDefaultTemplate && view.defaultTemplateId) {
          templateId = view.defaultTemplateId;
        } else if (view?.useDefaultTemplate !== false) {
          const defaultTemplate = await this.recordRepo.findDefaultTemplate(databaseId, transaction);
          if (defaultTemplate) {
            templateId = defaultTemplate.id;
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

        if (template.namePattern && (!recordName || recordName === "Untitled")) {
          recordName = await parseNamePattern(template.namePattern, databaseId, transaction);
        }

        for (const templateValue of template.values) {
          if (templateValue.value !== undefined && templateValue.value !== null) {
            templateValues[templateValue.propertyId] = templateValue.value;
          }
        }
      }

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

      this.logger.log("Record created", {
        recordId: record.id,
        databaseId,
        templateId: createRecordDto.templateId,
      });

      const createdRecord = await this.recordRepo.findUniqueOrThrowWithValues(record.id, transaction);
      return toRecordResponseDto(createdRecord);
    });
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

    return this.recordRepo.transaction(async (transaction) => {
      const template = await transaction.template.findFirst({
        where: { id: templateId, databaseId: record.databaseId },
        include: { values: true },
      });

      if (!template) {
        throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
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
        data: { templateId },
      });

      this.logger.log("Template applied", { recordId: id, templateId });
      const updated = await this.recordRepo.findUniqueOrThrowWithValues(id, transaction);
      return toRecordResponseDto(updated);
    });
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

      for (const value of source.values) {
        await transaction.propertyValue.create({
          data: {
            recordId: newRecord.id,
            propertyId: value.propertyId,
            value: value.value as Prisma.InputJsonValue,
            computed: value.computed,
          },
        });
      }

      this.logger.log("Record duplicated", { sourceId: id, newId: newRecord.id });

      const created = await this.recordRepo.findUniqueOrThrowWithValues(newRecord.id, transaction);
      return toRecordResponseDto(created);
    });
  }
}
