import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateSectionDto, SectionOperationDto, SectionOperationType, SectionResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { SectionRepository } from "../repositories/section.repository";

@Injectable()
export class SectionService {
  constructor(
    private readonly logger: AppLogger,
    private readonly sectionRepo: SectionRepository,
  ) {
    this.logger.setContext(SectionService.name);
  }

  async create(spaceId: string, dto: CreateSectionDto): Promise<SectionResponseDto> {
    this.logger.debug("Creating section", {
      spaceId,
      name: dto.name,
    });

    const section = await this.sectionRepo.create({
      name: dto.name,
      position: dto.position,
      icon: dto.icon,
      color: dto.color,
      spaceId,
    });
    this.logger.log("Section created", { sectionId: section.id, spaceId });
    return new SectionResponseDto(section);
  }

  async processOperations(tx: Prisma.TransactionClient, spaceId: string, operations: SectionOperationDto[]) {
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

  private async createInternal(tx: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.create) {
      throw new BadRequestException('CREATE operation requires "create" field with section data');
    }

    let position = operation.create.position;
    if (position === undefined) {
      const last = await this.sectionRepo.findLastPosition(spaceId, tx);
      position = last !== null ? last.position + 1 : 0;
    }

    await this.sectionRepo.create(
      {
        name: operation.create.name,
        position,
        icon: operation.create.icon,
        color: operation.create.color,
        spaceId,
      },
      tx,
    );
  }

  private async updateInternal(tx: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.id) {
      throw new BadRequestException('UPDATE operation requires "id" field');
    }

    const section = await this.sectionRepo.findById(operation.id, tx);

    if (!section) {
      throw new NotFoundException(`Section with id ${operation.id} not found`);
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(`Section with id ${operation.id} does not belong to this space`);
    }

    if (operation.update?.name) {
      const duplicate = await this.sectionRepo.findDuplicate(operation.update.name, spaceId, operation.id, tx);

      if (duplicate) {
        this.logger.warn("Duplicate section name", {
          spaceId,
          name: operation.update.name,
        });
        throw new BadRequestException(`Section with name "${operation.update.name}" already exists in this space`);
      }
    }

    await this.sectionRepo.update(
      operation.id,
      {
        name: operation.update?.name,
        position: operation.update?.position,
        icon: operation.update?.icon,
        color: operation.update?.color !== undefined ? operation.update.color || null : undefined,
      },
      tx,
    );
  }

  private async deleteInternal(tx: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.id) {
      throw new BadRequestException('DELETE operation requires "id" field');
    }

    const section = await this.sectionRepo.findById(operation.id, tx);

    if (!section) {
      throw new NotFoundException(`Section with id ${operation.id} not found`);
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(`Section with id ${operation.id} does not belong to this space`);
    }

    await this.sectionRepo.delete(operation.id, tx);

    this.logger.log("Section deleted", {
      sectionId: operation.id,
      spaceId,
    });
  }
}
