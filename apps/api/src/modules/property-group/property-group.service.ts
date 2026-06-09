import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreatePropertyGroupDto, PropertyGroupResponseDto, UpdatePropertyGroupDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyGroupRepository } from "./repositories/property-group.repository";

@Injectable()
export class PropertyGroupService {
  constructor(
    private readonly logger: AppLogger,
    private readonly groupRepo: PropertyGroupRepository,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(PropertyGroupService.name);
  }

  async create(databaseId: string, createDto: CreatePropertyGroupDto, userId: string): Promise<PropertyGroupResponseDto> {
    this.logger.debug("Creating property group", { databaseId });

    const database = await this.databaseRepo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    if (database.isLocked) throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));

    const group = await this.groupRepo.create({
      databaseId,
      name: createDto.name,
      position: createDto.position ?? 0,
      visibility: createDto.visibility as Prisma.InputJsonValue,
    });

    this.logger.log("Property group created", { groupId: group.id, databaseId });
    return new PropertyGroupResponseDto(group as unknown as Partial<PropertyGroupResponseDto>);
  }

  async update(id: string, updateDto: UpdatePropertyGroupDto, userId: string): Promise<PropertyGroupResponseDto> {
    this.logger.debug("Updating property group", { id });

    const group = await this.groupRepo.findById(id);
    if (!group) throw new NotFoundException(t("errors.PROPERTY_GROUP_NOT_FOUND"));

    const database = await this.databaseRepo.findDatabaseByOwner(group.databaseId, userId);
    if (!database) throw new ForbiddenException(t("errors.NOT_RESOURCE_OWNER"));
    if (database.isLocked) throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));

    const updated = await this.groupRepo.update(id, {
      name: updateDto.name,
      position: updateDto.position,
      visibility: updateDto.visibility as Prisma.InputJsonValue,
    });

    this.logger.log("Property group updated", { id });
    return new PropertyGroupResponseDto(updated as unknown as Partial<PropertyGroupResponseDto>);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.debug("Removing property group", { id });

    const group = await this.groupRepo.findById(id);
    if (!group) throw new NotFoundException(t("errors.PROPERTY_GROUP_NOT_FOUND"));

    const database = await this.databaseRepo.findDatabaseByOwner(group.databaseId, userId);
    if (!database) throw new ForbiddenException(t("errors.NOT_RESOURCE_OWNER"));
    if (database.isLocked) throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));

    await this.groupRepo.delete(id);
    this.logger.log("Property group removed", { id });
  }
}
