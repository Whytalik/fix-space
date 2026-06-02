import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateRecordDto, RecordResponseDto, UpdateRecordDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "./repositories/record.repository";

@Injectable()
export class RecordService {
  constructor(
    private readonly logger: AppLogger,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(RecordService.name);
  }

  async create(databaseId: string, createRecordDto: CreateRecordDto, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Creating record", { databaseId });

    const database = await this.recordRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(`Database with id ${databaseId} not found`);
    }

    const properties = await this.recordRepo.findPropertiesByDatabase(databaseId);

    const {
      id: resolvedTemplateId,
      name: templateName,
      icon: templateIcon,
      values: templateValues,
    } = await this.resolveTemplate(databaseId, createRecordDto.templateId);

    return await this.recordRepo.transaction(async (tx) => {
      const record = await this.recordRepo.create(
        {
          databaseId,
          templateId: resolvedTemplateId,
          name: createRecordDto.name ?? templateName,
          icon: createRecordDto.icon ?? templateIcon,
        },
        tx,
      );

      for (const property of properties) {
        const tmplVal = templateValues.has(property.id) ? templateValues.get(property.id) : undefined;
        await tx.propertyValue.create({
          data: {
            recordId: record.id,
            propertyId: property.id,
            value: tmplVal === null || tmplVal === undefined ? Prisma.DbNull : (tmplVal as Prisma.InputJsonValue),
            computed: false,
          },
        });
      }

      this.logger.log("Record created with property values", {
        recordId: record.id,
        databaseId,
        templateId: resolvedTemplateId,
        propertyCount: properties.length,
      });

      const createdRecord = await this.recordRepo.findUniqueOrThrowWithValues(record.id, tx);
      return new RecordResponseDto(createdRecord);
    });
  }

  async findAll(databaseId: string, userId: string): Promise<RecordResponseDto[]> {
    this.logger.debug("Finding all records", { databaseId });
    const records = await this.recordRepo.findAllByDatabase(databaseId, userId);
    return records.map((record) => new RecordResponseDto(record));
  }

  async findAllPaged(
    databaseId: string,
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: RecordResponseDto[]; total: number; page: number; pageSize: number }> {
    if (page < 1 || pageSize < 1) {
      throw new BadRequestException("page and pageSize must be positive integers");
    }

    this.logger.debug("Finding paged records", { databaseId, page, pageSize });

    const [records, total] = await this.recordRepo.findPagedByDatabase(
      databaseId,
      userId,
      (page - 1) * pageSize,
      pageSize,
    );

    this.logger.debug("Paged records found", { databaseId, total, page, pageSize });

    return {
      data: records.map((record) => new RecordResponseDto(record)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Finding record", { id });

    const record = await this.recordRepo.findByIdWithOwner(id, userId);

    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return new RecordResponseDto(record);
  }

  async update(id: string, updateRecordDto: UpdateRecordDto, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Updating record", { id });

    const existingRecord = await this.recordRepo.findByIdForOwnerCheck(id, userId);

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    const record = await this.recordRepo.update(id, {
      name: updateRecordDto.name,
      icon: updateRecordDto.icon,
    });

    this.logger.log("Record updated", { id });
    return new RecordResponseDto(record);
  }

  private async resolveTemplate(
    databaseId: string,
    templateId?: string | null,
  ): Promise<{ id: string | null; name?: string; icon?: string; values: Map<string, unknown> }> {
    const values = new Map<string, unknown>();

    if (templateId !== undefined) {
      if (templateId !== null) {
        const template = await this.recordRepo.findTemplateById(templateId, databaseId);
        if (template) {
          for (const tv of template.values) values.set(tv.propertyId, tv.value);
          return { id: template.id, name: template.name, icon: template.icon ?? undefined, values };
        }
      }
      return { id: null, values };
    }

    const defaultTemplate = await this.recordRepo.findDefaultTemplate(databaseId);

    if (defaultTemplate) {
      for (const tv of defaultTemplate.values) values.set(tv.propertyId, tv.value);
      return { id: defaultTemplate.id, name: defaultTemplate.name, icon: defaultTemplate.icon ?? undefined, values };
    }

    return { id: null, values };
  }

  async remove(id: string, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Removing record", { id });

    const existingRecord = await this.recordRepo.findByIdForOwnerCheck(id, userId);

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    const record = await this.recordRepo.delete(id);

    this.logger.log("Record removed", { id });
    return new RecordResponseDto(record);
  }
}
