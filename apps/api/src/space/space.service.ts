import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import {
  CreateSpaceDto,
  DEFAULT_SPACE_SETTINGS,
  SectionOperationDto,
  SpaceResponseDto,
  UpdateSpaceDto,
} from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { SettingsService } from "../settings/settings.service";
import { SectionService } from "./providers/section.service";
import { sectionsInclude } from "./space.constants";

@Injectable()
export class SpaceService {
  constructor(
    private readonly logger: AppLogger,
    private readonly sectionService: SectionService,
    private readonly settingsService: SettingsService,
  ) {
    this.logger.setContext(SpaceService.name);
  }

  async create(ownerId: string, dto: CreateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Creating space", {
      ownerId,
      name: dto.name,
    });

    const spaceSettings = await this.settingsService.getSettings(ownerId, "space", DEFAULT_SPACE_SETTINGS);

    const space = await prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.space.updateMany({
          where: { ownerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.space.create({
        data: {
          name: dto.name,
          icon: dto.icon,
          isDefault: dto.isDefault ?? false,
          ownerId,
          config: spaceSettings as unknown as Prisma.JsonValue,
        },
        include: sectionsInclude,
      });
    });

    this.logger.log("Space created", { spaceId: space.id, ownerId });
    return new SpaceResponseDto(space);
  }

  async findAll(ownerId: string): Promise<SpaceResponseDto[]> {
    this.logger.debug("Finding all spaces", { ownerId });
    const spaces = await prisma.space.findMany({
      where: { ownerId },
      include: sectionsInclude,
    });
    return spaces.map((space) => new SpaceResponseDto(space));
  }

  async findOne(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Finding space", { id });

    const space = await prisma.space.findUnique({
      where: { id },
      include: sectionsInclude,
    });

    if (!space) {
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    return new SpaceResponseDto(space);
  }

  async update(id: string, dto: UpdateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Updating space", { id });
    const { sectionOperations, ...spaceData } = dto;

    return prisma.$transaction(async (tx) => {
      if (sectionOperations?.length) {
        this.logger.debug("Processing section operations", {
          spaceId: id,
          count: sectionOperations.length,
        });
        await this.sectionService.processOperations(tx, id, sectionOperations as SectionOperationDto[]);
      }

      if (spaceData.isDefault === true) {
        const current = await tx.space.findUnique({ where: { id }, select: { ownerId: true } });
        if (current) {
          await tx.space.updateMany({
            where: { ownerId: current.ownerId, isDefault: true, id: { not: id } },
            data: { isDefault: false },
          });
        }
      }

      const space = await tx.space.update({
        where: { id },
        data: {
          name: spaceData.name,
          icon: spaceData.icon,
          isDefault: spaceData.isDefault,
        },
        include: sectionsInclude,
      });

      this.logger.log("Space updated", { spaceId: id });
      return new SpaceResponseDto(space);
    });
  }

  async remove(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Removing space", { id });

    const existing = await prisma.space.findUnique({ where: { id }, select: { isDefault: true } });
    if (existing?.isDefault) {
      throw new BadRequestException("Cannot delete the default space");
    }

    const space = await prisma.space.delete({ where: { id } });
    this.logger.log("Space removed", { id });
    return new SpaceResponseDto(space);
  }
}
