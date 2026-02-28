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

const sectionsInclude = {
  sections: {
    orderBy: {
      position: "asc" as const,
    },
    include: {
      databases: {
        orderBy: {
          createdAt: "asc" as const,
        },
      },
    },
  },
  databases: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

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

    try {
      const space = await prisma.space.create({
        data: {
          name: dto.name,
          icon: dto.icon,
          ownerId,
          config: spaceSettings as unknown as Prisma.JsonValue,
        },
        include: sectionsInclude,
      });

      this.logger.log("Space created", {
        spaceId: space.id,
        ownerId,
      });
      return new SpaceResponseDto(space);
    } catch (e: unknown) {
      if (
        (
          e as {
            code?: string;
          }
        )?.code === "P2002"
      ) {
        this.logger.warn("Duplicate space name", {
          ownerId,
          name: dto.name,
        });
        throw new BadRequestException("Space with this name already exists for the owner");
      }
      throw e;
    }
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

      try {
        const space = await tx.space.update({
          where: { id },
          data: {
            name: spaceData.name,
            icon: spaceData.icon,
          },
          include: sectionsInclude,
        });

        this.logger.log("Space updated", { spaceId: id });
        return new SpaceResponseDto(space);
      } catch (e: unknown) {
        if (
          (
            e as {
              code?: string;
            }
          )?.code === "P2025"
        ) {
          throw new NotFoundException(`Space with id ${id} not found`);
        }
        if (
          (
            e as {
              code?: string;
            }
          )?.code === "P2002"
        ) {
          this.logger.warn("Duplicate space name on update", { id });
          throw new BadRequestException("Space with this name already exists for the owner");
        }
        throw e;
      }
    });
  }

  async remove(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Removing space", { id });

    try {
      const space = await prisma.space.delete({
        where: { id },
      });

      this.logger.log("Space removed", { id });
      return new SpaceResponseDto(space);
    } catch (e: unknown) {
      if (
        (
          e as {
            code?: string;
          }
        )?.code === "P2025"
      ) {
        throw new NotFoundException(`Space with id ${id} not found`);
      }
      throw e;
    }
  }
}
