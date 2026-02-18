import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  RecordContentResponseDto,
  UpdateRecordContentDto,
} from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { defaultRecordContentConfig } from './record-content.config';

@Injectable()
export class RecordContentService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(RecordContentService.name);
  }

  async findOrCreate(recordId: string): Promise<RecordContentResponseDto> {
    this.logger.debug('Finding or creating record content', { recordId });

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

      this.logger.log('Record content created', {
        contentId: content.id,
        recordId,
      });
    }

    return new RecordContentResponseDto(content);
  }

  async upsert(
    recordId: string,
    updateRecordContentDto: UpdateRecordContentDto,
  ): Promise<RecordContentResponseDto> {
    this.logger.debug('Upserting record content', { recordId });

    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    const content = await prisma.recordContent.upsert({
      where: { recordId },
      update: {
        lastEditedAt: new Date(),
      },
      create: {
        recordId,
        config: defaultRecordContentConfig as Prisma.JsonValue,
      },
    });

    this.logger.log('Record content upserted', {
      contentId: content.id,
      recordId,
    });
    return new RecordContentResponseDto(content);
  }

  async remove(recordId: string): Promise<RecordContentResponseDto> {
    this.logger.debug('Removing record content', { recordId });

    const existingContent = await prisma.recordContent.findUnique({
      where: { recordId },
    });

    if (!existingContent) {
      throw new NotFoundException(
        `RecordContent for record ${recordId} not found`,
      );
    }

    const content = await prisma.recordContent.delete({
      where: { recordId },
    });

    this.logger.log('Record content removed', { recordId });
    return new RecordContentResponseDto(content);
  }
}
