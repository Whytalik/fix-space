import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateSpaceDto, SectionOperationDto, SpaceResponseDto, UpdateSpaceDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";
import { SettingsService } from "../settings/settings.service";
import { SectionService } from "./providers/section.service";
import { SpaceRepository } from "./space.repository";
import { sectionsInclude } from "./space.constants";
import { toSpaceResponseDto } from "./utils/to-space-response.dto";

@Injectable()
export class SpaceService {
  constructor(
    private readonly logger: AppLogger,
    private readonly sectionService: SectionService,
    private readonly settingsService: SettingsService,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(SpaceService.name);
  }

  async create(ownerId: string, dto: CreateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Creating space", {
      ownerId,
      name: dto.name,
    });

    const space = await this.spaceRepo.transaction(async (tx) => {
      if (dto.isDefault) {
        await this.spaceRepo.updateMany({ ownerId, isDefault: true }, { isDefault: false }, tx);
      }
      return this.spaceRepo.create(
        {
          name: dto.name,
          icon: dto.icon,
          isDefault: dto.isDefault ?? false,
          ownerId,
        },
        sectionsInclude,
        tx,
      );
    });

    this.logger.log("Space created", { spaceId: space.id, ownerId });
    return toSpaceResponseDto(space);
  }

  async findAll(ownerId: string): Promise<SpaceResponseDto[]> {
    this.logger.debug("Finding all spaces", { ownerId });
    const spaces = await this.spaceRepo.findAll(ownerId, sectionsInclude);
    return spaces.map(toSpaceResponseDto);
  }

  async findOne(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Finding space", { id });

    const space = await this.spaceRepo.findOne(id, sectionsInclude);

    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id }));
    }

    return toSpaceResponseDto(space);
  }

  async update(id: string, dto: UpdateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Updating space", { id });
    const { sectionOperations, ...spaceData } = dto;

    return this.spaceRepo.transaction(async (tx) => {
      if (sectionOperations?.length) {
        this.logger.debug("Processing section operations", {
          spaceId: id,
          count: sectionOperations.length,
        });
        await this.sectionService.processOperations(tx, id, sectionOperations as SectionOperationDto[]);
      }

      if (spaceData.isDefault === true) {
        const current = await this.spaceRepo.findOwner(id, tx);
        if (current) {
          await this.spaceRepo.updateMany(
            { ownerId: current.ownerId, isDefault: true, id: { not: id } },
            { isDefault: false },
            tx,
          );
        }
      }

      const space = await this.spaceRepo.update(
        id,
        {
          name: spaceData.name,
          icon: spaceData.icon,
          isDefault: spaceData.isDefault,
        },
        sectionsInclude,
        tx,
      );

      this.logger.log("Space updated", { spaceId: id });
      return toSpaceResponseDto(space);
    });
  }

  async remove(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Removing space", { id });

    const existing = await this.spaceRepo.findOwner(id);
    if (existing?.isDefault) {
      throw new BadRequestException(t("errors.CANNOT_DELETE_DEFAULT_SPACE"));
    }

    const space = await this.spaceRepo.delete(id);
    this.logger.log("Space removed", { id });
    return toSpaceResponseDto(space);
  }
}
