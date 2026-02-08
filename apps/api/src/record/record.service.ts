import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { CreateRecordDto, UpdateRecordDto } from '@nucleus/domain';
import { defaultRecordConfig } from '../config/schemas';

@Injectable()
export class RecordService {
  async create(databaseId: string, createRecordDto: CreateRecordDto) {
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

      return await tx.record.findUnique({
        where: { id: record.id },
        include: { values: true, content: true },
      });
    });
  }

  async findAll(databaseId: string) {
    return await prisma.record.findMany({
      where: { databaseId },
      include: { values: true, content: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await prisma.record.findUnique({
      where: { id },
      include: { values: true, content: true },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return record;
  }

  async update(id: string, updateRecordDto: UpdateRecordDto) {
    const existingRecord = await prisma.record.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return await prisma.record.update({
      where: { id },
      data: {
        name: updateRecordDto.name,
        icon: updateRecordDto.icon,
      },
      include: { values: true, content: true },
    });
  }

  async remove(id: string) {
    const existingRecord = await prisma.record.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return await prisma.record.delete({
      where: { id },
    });
  }
}
