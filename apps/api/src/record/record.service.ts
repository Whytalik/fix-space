import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  CreateRecordDto,
  RecordResponseDto,
  UpdateRecordDto,
} from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { defaultRecordConfig } from './record.config';

@Injectable()
export class RecordService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(RecordService.name);
  }

  async create(
    databaseId: string,
    createRecordDto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    this.logger.debug('Creating record', { databaseId });

    const database = await prisma.database.findUnique({
      where: { id: databaseId },
    });

    if (!database) {
      throw new NotFoundException(`Database with id ${databaseId} not found`);
    }

    const properties = await prisma.property.findMany({
      where: { databaseId },
    });

    return await prisma.$transaction(async (tx) => {
      const record = await tx.record.create({
        data: {
          databaseId,
          name: createRecordDto.name,
          icon: createRecordDto.icon,
          config: defaultRecordConfig as Prisma.JsonValue,
        },
      });

      for (const property of properties) {
        await tx.propertyValue.create({
          data: {
            recordId: record.id,
            propertyId: property.id,
            value: null,
            computed: false,
          },
        });
      }

      this.logger.log('Record created with property values', {
        recordId: record.id,
        databaseId,
        propertyCount: properties.length,
      });

      const createdRecord = await tx.record.findUnique({
        where: { id: record.id },
        include: { values: true, content: true },
      });

      return new RecordResponseDto(createdRecord!);
    });
  }

  async findAll(databaseId: string): Promise<RecordResponseDto[]> {
    this.logger.debug('Finding all records', { databaseId });
    const records = await prisma.record.findMany({
      where: { databaseId },
      include: { values: true, content: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => new RecordResponseDto(record));
  }

  async findOne(id: string): Promise<RecordResponseDto> {
    this.logger.debug('Finding record', { id });

    const record = await prisma.record.findUnique({
      where: { id },
      include: { values: true, content: true },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return new RecordResponseDto(record);
  }

  async update(
    id: string,
    updateRecordDto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    this.logger.debug('Updating record', { id });

    const existingRecord = await prisma.record.findUnique({
      where: { id },
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
      include: { values: true, content: true },
    });

    this.logger.log('Record updated', { id });
    return new RecordResponseDto(record);
  }

  async remove(id: string): Promise<RecordResponseDto> {
    this.logger.debug('Removing record', { id });

    const existingRecord = await prisma.record.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    const record = await prisma.record.delete({
      where: { id },
    });

    this.logger.log('Record removed', { id });
    return new RecordResponseDto(record);
  }
}
