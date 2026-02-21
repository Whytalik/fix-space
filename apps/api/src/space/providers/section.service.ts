import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  CreateSectionDto,
  SectionOperationDto,
  SectionOperationType,
  SectionResponseDto,
} from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';

@Injectable()
export class SectionService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(SectionService.name);
  }

  async create(
    spaceId: string,
    dto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    this.logger.debug('Creating section', { spaceId, name: dto.name });

    try {
      const section = await prisma.section.create({
        data: {
          name: dto.name,
          position: dto.position,
          icon: dto.icon,
          color: dto.color,
          spaceId,
        },
      });

      this.logger.log('Section created', {
        sectionId: section.id,
        spaceId,
      });
      return new SectionResponseDto(section);
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'P2003') {
        throw new NotFoundException(`Space with id ${spaceId} not found`);
      }
      throw e;
    }
  }

  async processOperations(
    tx: Prisma.TransactionClient,
    spaceId: string,
    operations: SectionOperationDto[],
  ) {
    for (const operation of operations) {
      switch (operation.operation) {
        case SectionOperationType.CREATE:
          await this.createInternal(tx, spaceId, operation);
          break;
        case SectionOperationType.UPDATE:
          await this.updateInternal(tx, spaceId, operation);
          break;
        case SectionOperationType.DELETE:
          await this.deleteInternal(tx, spaceId, operation);
          break;
      }
    }
  }

  private async createInternal(
    tx: Prisma.TransactionClient,
    spaceId: string,
    operation: SectionOperationDto,
  ) {
    if (!operation.create) {
      throw new BadRequestException(
        'CREATE operation requires "create" field with section data',
      );
    }

    await tx.section.create({
      data: {
        name: operation.create.name,
        position: operation.create.position,
        icon: operation.create.icon,
        color: operation.create.color,
        spaceId,
      },
    });
  }

  private async updateInternal(
    tx: Prisma.TransactionClient,
    spaceId: string,
    operation: SectionOperationDto,
  ) {
    if (!operation.id) {
      throw new BadRequestException('UPDATE operation requires "id" field');
    }

    const section = await tx.section.findUnique({
      where: { id: operation.id },
    });

    if (!section) {
      throw new NotFoundException(`Section with id ${operation.id} not found`);
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(
        `Section with id ${operation.id} does not belong to this space`,
      );
    }

    if (operation.update?.name) {
      const duplicate = await tx.section.findFirst({
        where: {
          name: operation.update.name,
          spaceId,
          id: { not: operation.id },
        },
      });

      if (duplicate) {
        this.logger.warn('Duplicate section name', {
          spaceId,
          name: operation.update.name,
        });
        throw new BadRequestException(
          `Section with name "${operation.update.name}" already exists in this space`,
        );
      }
    }

    await tx.section.update({
      where: { id: operation.id },
      data: {
        name: operation.update?.name,
        position: operation.update?.position,
        icon: operation.update?.icon,
        color: operation.update?.color,
      },
    });
  }

  private async deleteInternal(
    tx: Prisma.TransactionClient,
    spaceId: string,
    operation: SectionOperationDto,
  ) {
    if (!operation.id) {
      throw new BadRequestException('DELETE operation requires "id" field');
    }

    const section = await tx.section.findUnique({
      where: { id: operation.id },
    });

    if (!section) {
      throw new NotFoundException(`Section with id ${operation.id} not found`);
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(
        `Section with id ${operation.id} does not belong to this space`,
      );
    }

    await tx.section.delete({
      where: { id: operation.id },
    });

    this.logger.log('Section deleted', { sectionId: operation.id, spaceId });
  }
}
