import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateRecordContentDto } from '@nucleus/domain';

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
