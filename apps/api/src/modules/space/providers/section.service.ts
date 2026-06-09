import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import {
  CreateSectionDto,
  DEFAULT_SECTION_SETTINGS,
  SectionOperationDto,
  SectionOperationType,
  SectionResponseDto,
} from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { SettingsCategory } from "@/modules/settings/constants/settings.constants";
import { SettingsService } from "@/modules/settings/settings.service";
import { SectionRepository } from "../repositories/section.repository";

@Injectable()
export class SectionService {
  constructor(
    private readonly logger: AppLogger,
    private readonly settingsService: SettingsService,
    private readonly sectionRepo: SectionRepository,
  ) {
    this.logger.setContext(SectionService.name);
  }

  async create(spaceId: string, dto: CreateSectionDto, transaction?: Prisma.TransactionClient): Promise<SectionResponseDto> {
    this.logger.debug("Creating section", {
      spaceId,
      name: dto.name,
    });

    const section = await this.sectionRepo.create(
      {
        name: dto.name,
        position: dto.position,
        icon: dto.icon,
        color: dto.color,
        spaceId,
      },
      transaction,
    );
    this.logger.log("Section created", { sectionId: section.id, spaceId });
    return new SectionResponseDto(section);
  }

  async processOperations(transaction: Prisma.TransactionClient, spaceId: string, operations: SectionOperationDto[]) {
    for (const operation of operations) {
      switch (operation.operation) {
        case SectionOperationType.CREATE:
          await this.createInternal(transaction, spaceId, operation);
          break;
        case SectionOperationType.UPDATE:
          await this.updateInternal(transaction, spaceId, operation);
          break;
        case SectionOperationType.DELETE:
          await this.deleteInternal(transaction, spaceId, operation);
          break;
      }
    }
  }

  private async createInternal(transaction: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.create) {
      throw new BadRequestException(t("errors.SECTION_CREATE_REQUIRES_DATA"));
    }

    let position = operation.create.position;
    if (position === undefined) {
      const last = await this.sectionRepo.findLastPosition(spaceId, transaction);
      position = last !== null ? last.position + 1 : 0;
    }

    let effectiveIcon = operation.create.icon;
    let effectiveColor = operation.create.color;

    if (!effectiveIcon || effectiveColor === undefined) {
      const space = await transaction.space.findUnique({ where: { id: spaceId }, select: { ownerId: true } });
      if (space) {
        const sectionDefaults = await this.settingsService.getSettings(space.ownerId, SettingsCategory.SECTION, DEFAULT_SECTION_SETTINGS);
        effectiveIcon ??= sectionDefaults.defaultSectionIcon;
        effectiveColor ??= sectionDefaults.defaultSectionColor;
      }
    }

    await this.sectionRepo.create(
      {
        name: operation.create.name,
        position,
        icon: effectiveIcon,
        color: effectiveColor,
        spaceId,
      },
      transaction,
    );
  }

  private async updateInternal(transaction: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.id) {
      throw new BadRequestException(t("errors.SECTION_OPERATION_REQUIRES_ID"));
    }

    const section = await this.sectionRepo.findById(operation.id, transaction);

    if (!section) {
      throw new NotFoundException(t("errors.SECTION_NOT_FOUND_ID", { id: operation.id }));
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(t("errors.SECTION_NOT_IN_SPACE"));
    }

    if (operation.update?.name) {
      const duplicate = await this.sectionRepo.findDuplicate(operation.update.name, spaceId, operation.id, transaction);

      if (duplicate) {
        this.logger.warn("Duplicate section name", {
          spaceId,
          name: operation.update.name,
        });
        throw new BadRequestException(t("errors.SECTION_NAME_TAKEN"));
      }
    }

    const updateData = filterUndefined({
      fields: {
        name: operation.update?.name,
        position: operation.update?.position,
        icon: operation.update?.icon,
      },
      nullableFields: { color: operation.update?.color },
    });

    await this.sectionRepo.update(operation.id, updateData, transaction);
  }

  private async deleteInternal(transaction: Prisma.TransactionClient, spaceId: string, operation: SectionOperationDto) {
    if (!operation.id) {
      throw new BadRequestException(t("errors.SECTION_OPERATION_REQUIRES_ID"));
    }

    const section = await this.sectionRepo.findById(operation.id, transaction);

    if (!section) {
      throw new NotFoundException(t("errors.SECTION_NOT_FOUND_ID", { id: operation.id }));
    }

    if (section.spaceId !== spaceId) {
      throw new BadRequestException(t("errors.SECTION_NOT_IN_SPACE"));
    }

    await this.sectionRepo.delete(operation.id, transaction);

    this.logger.log("Section deleted", {
      sectionId: operation.id,
      spaceId,
    });
  }
}
