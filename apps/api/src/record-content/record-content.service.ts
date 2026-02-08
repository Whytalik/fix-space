import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { UpdateRecordContentDto } from '@nucleus/domain';
import { defaultRecordContentConfig } from '../config/schemas';

@Injectable()
export class RecordContentService {
  async findOrCreate(recordId: string) {
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    let content = await prisma.recordContent.findUnique({
      where: { recordId },
    });

    if (!content) {
      content = await prisma.recordContent.create({
        data: {
          recordId,
          config: defaultRecordContentConfig as Prisma.JsonValue,
        },
      });
    }

    return content;
  }

  async upsert(
    recordId: string,
    updateRecordContentDto: UpdateRecordContentDto,
  ) {
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    return await prisma.recordContent.upsert({
      where: { recordId },
      update: {
        lastEditedAt: new Date(),
      },
      create: {
        recordId,
        config: defaultRecordContentConfig as Prisma.JsonValue,
      },
    });
  }

  async remove(recordId: string) {
    const existingContent = await prisma.recordContent.findUnique({
      where: { recordId },
    });

    if (!existingContent) {
      throw new NotFoundException(
        `RecordContent for record ${recordId} not found`,
      );
    }

    return await prisma.recordContent.delete({
      where: { recordId },
    });
  }
}
