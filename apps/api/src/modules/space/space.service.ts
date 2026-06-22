import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateSpaceDto, SpaceResponseDto, UpdateSpaceDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { DatabaseService } from "@/modules/database/database.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { SettingsCategory } from "@fixspace/domain";
import { SettingsService } from "@/modules/settings/settings.service";
import { SectionService } from "./providers/section.service";
import { SpaceRepository } from "./repositories/space.repository";
import { toSpaceResponseDto } from "./utils/to-space-response.util";

@Injectable()
export class SpaceService {
  constructor(
    private readonly logger: AppLogger,
    private readonly databaseService: DatabaseService,
    private readonly settingsService: SettingsService,
    private readonly sectionService: SectionService,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(SpaceService.name);
  }

  async create(ownerId: string, dto: CreateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Creating space", {
      ownerId,
      name: dto.name,
    });

    const count = await this.spaceRepo.count(ownerId);
    if (count >= 5) {
      throw new BadRequestException(t("errors.SPACE_LIMIT_REACHED"));
    }

    const { icon } = await this.settingsService.resolveDefaults(ownerId, SettingsCategory.SPACE, { icon: dto.icon });

    return this.spaceRepo.transaction(async (transaction) => {
      if (dto.isDefault === true) {
        await this.spaceRepo.updateMany({ ownerId, isDefault: true }, { isDefault: false }, transaction);
      }

      const space = await this.spaceRepo.createWithSections(
        {
          name: dto.name,
          icon,
          isDefault: dto.isDefault ?? false,
          ownerId,
        },
        transaction,
      );

      this.logger.log("Space created", { spaceId: space.id, ownerId });
      return toSpaceResponseDto(space);
    });
  }

  async findAll(ownerId: string): Promise<SpaceResponseDto[]> {
    this.logger.debug("Finding all spaces", { ownerId });
    const spaces = await this.spaceRepo.findAllWithSections(ownerId);
    return spaces.map(toSpaceResponseDto);
  }

  async findOne(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Finding space", { id });

    const space = await this.spaceRepo.findOneWithSections(id);

    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id }));
    }

    return toSpaceResponseDto(space);
  }

  async update(id: string, updateSpaceDto: UpdateSpaceDto): Promise<SpaceResponseDto> {
    this.logger.debug("Updating space", { id });
    const { sectionOperations, databaseOperations, ...spaceData } = updateSpaceDto;

    return this.spaceRepo.transaction(async (transaction) => {
      if (sectionOperations?.length) {
        this.logger.debug("Processing section operations", {
          spaceId: id,
          count: sectionOperations.length,
        });
        await this.sectionService.processOperations(transaction, id, sectionOperations);
      }

      if (databaseOperations?.length) {
        this.logger.debug("Processing database operations", {
          spaceId: id,
          count: databaseOperations.length,
        });
        await this.databaseService.processDatabaseOperations(transaction, id, databaseOperations);
      }

      if (spaceData.isDefault === true) {
        const current = await this.spaceRepo.findOwner(id, transaction);
        if (current) {
          await this.spaceRepo.updateMany(
            { ownerId: current.ownerId, isDefault: true, id: { not: id } },
            { isDefault: false },
            transaction,
          );
        }
      }

      const updateData = filterUndefined({
        fields: { name: spaceData.name, icon: spaceData.icon, isDefault: spaceData.isDefault },
      });

      const space = await this.spaceRepo.updateWithSections(id, updateData, transaction);

      this.logger.log("Space updated", { spaceId: id });
      return toSpaceResponseDto(space);
    });
  }

  async remove(id: string): Promise<SpaceResponseDto> {
    this.logger.debug("Removing space", { id });

    const space = await this.spaceRepo.findOneWithSections(id);
    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id }));
    }
    if (space.isDefault) {
      throw new BadRequestException(t("errors.CANNOT_DELETE_DEFAULT_SPACE"));
    }

    await this.spaceRepo.delete(id);
    this.logger.log("Space removed", { id });
    return toSpaceResponseDto(space);
  }
}
