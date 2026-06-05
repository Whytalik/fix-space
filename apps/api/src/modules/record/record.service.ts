import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateRecordDto, RecordResponseDto, UpdateRecordDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { filterUndefined } from "../../common/utils/filter-undefined";
import { t } from "../../common/utils/i18n.helper";
import { RecordRepository } from "./repositories/record.repository";
import { toRecordResponseDto } from "./utils/to-record-response.util";

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
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    const properties = await this.recordRepo.findPropertiesByDatabase(databaseId);

    return await this.recordRepo.transaction(async (transaction) => {
      const templateValues: Record<string, unknown> = {};

      if (createRecordDto.templateId) {
        const template = await transaction.template.findFirst({
          where: {
            id: createRecordDto.templateId,
            databaseId,
          },
          include: {
            values: true,
          },
        });

        if (!template) {
          throw new NotFoundException(`Template with id ${createRecordDto.templateId} not found in this database`);
        }

        for (const val of template.values) {
          if (val.value !== undefined && val.value !== null) {
            templateValues[val.propertyId] = val.value;
          }
        }
      }

      const record = await this.recordRepo.create(
        {
          databaseId,
          name: createRecordDto.name,
          icon: createRecordDto.icon,
          templateId: createRecordDto.templateId,
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
}
