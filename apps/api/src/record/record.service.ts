import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { CreateRecordDto, RecordResponseDto, UpdateRecordDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";

@Injectable()
export class RecordService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(RecordService.name);
  }

  async create(databaseId: string, createRecordDto: CreateRecordDto, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Creating record", { databaseId });

    const database = await prisma.database.findFirst({
      where: {
        id: databaseId,
        space: {
          ownerId: userId,
        },
      },
      select: { id: true, recordLimit: true },
    });

    if (!database) {
      throw new NotFoundException(`Database with id ${databaseId} not found`);
    }

    if (database.recordLimit) {
      const count = await prisma.record.count({ where: { databaseId } });
      if (count >= database.recordLimit) {
        throw new BadRequestException(`Record limit of ${database.recordLimit} reached`);
      }
    }

    const properties = await prisma.property.findMany({
      where: {
        databaseId,
      },
    });

    return await prisma.$transaction(async (tx) => {
      const record = await tx.record.create({
        data: {
          databaseId,
          name: createRecordDto.name,
          icon: createRecordDto.icon,
        },
      });

      for (const property of properties) {
        await tx.propertyValue.create({
          data: {
            recordId: record.id,
            propertyId: property.id,
            value: Prisma.DbNull,
            computed: false,
          },
        });
      }

      this.logger.log("Record created with property values", {
        recordId: record.id,
        databaseId,
        propertyCount: properties.length,
      });

      const createdRecord = await tx.record.findUniqueOrThrow({
        where: {
          id: record.id,
        },
        include: {
          values: true,
          content: true,
        },
      });

      return new RecordResponseDto(createdRecord);
    });
  }

  async findAll(databaseId: string, userId: string): Promise<RecordResponseDto[]> {
    this.logger.debug("Finding all records", { databaseId });
    const records = await prisma.record.findMany({
      where: {
        databaseId,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
      include: {
        values: true,
        content: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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

    const where = {
      databaseId,
      database: {
        space: {
          ownerId: userId,
        },
      },
    };

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        include: {
          values: true,
          content: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.record.count({ where }),
    ]);

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

    const record = await prisma.record.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
      include: {
        values: true,
        content: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return new RecordResponseDto(record);
  }

  async update(id: string, updateRecordDto: UpdateRecordDto, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Updating record", { id });

    const existingRecord = await prisma.record.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    const record = await prisma.record.update({
      where: { id },
      data: {
        name: updateRecordDto.name,
        icon: updateRecordDto.icon,
      },
      include: {
        values: true,
        content: true,
      },
    });

    this.logger.log("Record updated", { id });
    return new RecordResponseDto(record);
  }

  async remove(id: string, userId: string): Promise<RecordResponseDto> {
    this.logger.debug("Removing record", { id });

    const existingRecord = await prisma.record.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    const record = await prisma.record.delete({
      where: { id },
    });

    this.logger.log("Record removed", { id });
    return new RecordResponseDto(record);
  }
}
