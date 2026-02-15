import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import {
  CreateSectionDto,
  CreateSpaceDto,
  SectionOperationDto,
  SectionOperationType,
  UpdateSpaceDto,
} from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { defaultSpaceConfig } from './space.config';

const sectionsInclude = {
  sections: {
    orderBy: {
      position: 'asc' as const,
    },
  },
};

@Injectable()
export class SpaceService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(SpaceService.name);
  }

  async create(ownerId: string, dto: CreateSpaceDto) {
    this.logger.debug('Creating space', { ownerId, name: dto.name });

    try {
      const space = await prisma.space.create({
        data: {
          name: dto.name,
          icon: dto.icon,
          ownerId,
          config: defaultSpaceConfig as Prisma.JsonValue,
        },
        include: sectionsInclude,
      });

      this.logger.log('Space created', { spaceId: space.id, ownerId });
      return space;
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'P2002') {
        this.logger.warn('Duplicate space name', { ownerId, name: dto.name });
        throw new BadRequestException(
          'Space with this name already exists for the owner',
        );
      }
      throw e;
    }
  }

  async findAll(ownerId: string) {
    this.logger.debug('Finding all spaces', { ownerId });
    return prisma.space.findMany({
      where: { ownerId },
      include: sectionsInclude,
    });
  }

  async findOne(id: string) {
    this.logger.debug('Finding space', { id });

    const space = await prisma.space.findUnique({
      where: { id },
      include: sectionsInclude,
    });

    if (!space) {
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    return space;
  }

  async update(id: string, dto: UpdateSpaceDto) {
    this.logger.debug('Updating space', { id });
    const { sectionOperations, ...spaceData } = dto;

    return prisma.$transaction(async (tx) => {
      if (sectionOperations?.length) {
        this.logger.debug('Processing section operations', {
          spaceId: id,
          count: sectionOperations.length,
        });
        await this.processSectionOperations(
          tx,
          id,
          sectionOperations as SectionOperationDto[],
        );
      }

      try {
        const space = await tx.space.update({
          where: { id },
          data: {
            name: spaceData.name,
            icon: spaceData.icon,
          },
          include: sectionsInclude,
        });

        this.logger.log('Space updated', { spaceId: id });
        return space;
      } catch (e: unknown) {
        if ((e as { code?: string })?.code === 'P2025') {
          throw new NotFoundException(`Space with id ${id} not found`);
        }
        if ((e as { code?: string })?.code === 'P2002') {
          this.logger.warn('Duplicate space name on update', { id });
          throw new BadRequestException(
            'Space with this name already exists for the owner',
          );
        }
        throw e;
      }
    });
  }

  async remove(id: string) {
    this.logger.debug('Removing space', { id });

    try {
      const space = await prisma.space.delete({
        where: { id },
      });

      this.logger.log('Space removed', { id });
      return space;
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'P2025') {
        throw new NotFoundException(`Space with id ${id} not found`);
      }
      throw e;
    }
  }

  async createSection(spaceId: string, dto: CreateSectionDto) {
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
      return section;
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'P2003') {
        throw new NotFoundException(`Space with id ${spaceId} not found`);
      }
      throw e;
    }
  }

  // ===== Section operations =====

  private async processSectionOperations(
    tx: Prisma.TransactionClient,
    spaceId: string,
    operations: SectionOperationDto[],
  ) {
    for (const operation of operations) {
      switch (operation.operation) {
        case SectionOperationType.CREATE:
          await this.createSectionInternal(tx, spaceId, operation);
          break;
        case SectionOperationType.UPDATE:
          await this.updateSectionInternal(tx, spaceId, operation);
          break;
        case SectionOperationType.DELETE:
          await this.deleteSectionInternal(tx, spaceId, operation);
          break;
      }
    }
  }

  private async createSectionInternal(
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

  private async updateSectionInternal(
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

  private async deleteSectionInternal(
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
