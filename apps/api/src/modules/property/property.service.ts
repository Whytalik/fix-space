import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreatePropertyDto, PropertyResponseDto, PropertyType, UpdatePropertyDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";
import { PropertyRepository } from "./repositories/property.repository";
import { PropertyTypeRegistry } from "./types";
import { toPropertyResponseDto } from "./utils/to-property-response.dto";

@Injectable()
export class PropertyService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly propertyRepo: PropertyRepository,
  ) {
    this.logger.setContext(PropertyService.name);
  }

  async create(databaseId: string, createPropertyDto: CreatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Creating property", {
      databaseId,
      name: createPropertyDto.name,
    });

    const database = await this.propertyRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    const isPropertyNameTaken = await this.propertyRepo.findByNameInDatabase(createPropertyDto.name, databaseId);

    if (isPropertyNameTaken) {
      this.logger.warn("Duplicate property name", {
        databaseId,
        name: createPropertyDto.name,
      });
      throw new ConflictException(t("errors.PROPERTY_NAME_TAKEN"));
    }

    const handler = this.typeRegistry.getConfigHandler(createPropertyDto.type);
    const defaultConfig = handler.getDefaultConfig();
    const mergedConfig = createPropertyDto.config
      ? {
          ...defaultConfig,
          ...createPropertyDto.config,
        }
      : defaultConfig;

    const configErrors = handler.validateConfig(mergedConfig);
    if (configErrors) {
      throw new BadRequestException(
        t("errors.INVALID_CONFIG", { type: createPropertyDto.type, errors: configErrors.join("; ") }),
      );
    }

    const [property] = await this.propertyRepo.transaction(async (tx) => {
      const created = await this.propertyRepo.create(
        {
          name: createPropertyDto.name,
          type: createPropertyDto.type,
          position: createPropertyDto.position,
          icon: createPropertyDto.icon,
          hint: createPropertyDto.hint,
          group: createPropertyDto.group,
          isRequired: createPropertyDto.isRequired ?? false,
          isVisible: createPropertyDto.isVisible ?? true,
          databaseId,
          config: mergedConfig as Prisma.InputJsonValue,
        } as Prisma.PropertyUncheckedCreateInput,
        tx,
      );

      const existingRecords = await tx.record.findMany({
        where: {
          databaseId,
        },
        select: {
          id: true,
        },
      });

      if (existingRecords.length > 0) {
        await tx.propertyValue.createMany({
          data: existingRecords.map((record) => ({
            recordId: record.id,
            propertyId: created.id,
            value: Prisma.DbNull,
            computed: false,
          })),
        });
      }

      return [created];
    });

    this.logger.log("Property created", {
      propertyId: property.id,
      databaseId,
    });
    return toPropertyResponseDto(property);
  }

  async findAll(databaseId: string, userId: string): Promise<PropertyResponseDto[]> {
    this.logger.debug("Finding all properties", { databaseId });
    const properties = await this.propertyRepo.findAllByDatabase(databaseId, userId);
    return properties.map(toPropertyResponseDto);
  }

  async findOne(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Finding property", { id });

    const property = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!property) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    return toPropertyResponseDto(property);
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Updating property", { id });

    const existingProperty = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!existingProperty) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    if (updatePropertyDto.name && updatePropertyDto.name !== existingProperty.name) {
      const isPropertyNameTaken = await this.propertyRepo.findByNameExcluding(
        updatePropertyDto.name,
        existingProperty.databaseId,
        id,
      );

      if (isPropertyNameTaken) {
        this.logger.warn("Duplicate property name on update", {
          id,
          name: updatePropertyDto.name,
        });
        throw new ConflictException(t("errors.PROPERTY_NAME_TAKEN"));
      }
    }

    let configToSave = existingProperty.config as Record<string, unknown> | undefined;

    if (updatePropertyDto.type && updatePropertyDto.type !== existingProperty.type) {
      const handler = this.typeRegistry.getConfigHandler(updatePropertyDto.type);
      configToSave = handler.getDefaultConfig();
    }

    if (updatePropertyDto.config) {
      const effectiveType = updatePropertyDto.type ?? (existingProperty.type as PropertyType);
      const handler = this.typeRegistry.getConfigHandler(effectiveType);
      const merged = {
        ...configToSave,
        ...updatePropertyDto.config,
      };
      const configErrors = handler.validateConfig(merged);
      if (configErrors) {
        throw new BadRequestException(
          t("errors.INVALID_CONFIG", { type: effectiveType, errors: configErrors.join("; ") }),
        );
      }
      configToSave = merged;
    }

    const typeChanged = updatePropertyDto.type !== undefined && updatePropertyDto.type !== existingProperty.type;

    const property = await this.propertyRepo.transaction(async (tx) => {
      if (typeChanged) {
        await tx.propertyValue.updateMany({
          where: { propertyId: id },
          data: { value: Prisma.DbNull },
        });
      }

      return this.propertyRepo.update(
        id,
        {
          ...(updatePropertyDto.name !== undefined && { name: updatePropertyDto.name }),
          ...(updatePropertyDto.type !== undefined && { type: updatePropertyDto.type }),
          ...(updatePropertyDto.position !== undefined && { position: updatePropertyDto.position }),
          ...(updatePropertyDto.icon !== undefined && { icon: updatePropertyDto.icon }),
          ...(updatePropertyDto.hint !== undefined && { hint: updatePropertyDto.hint }),
          ...(updatePropertyDto.group !== undefined && { group: updatePropertyDto.group }),
          ...(updatePropertyDto.isRequired !== undefined && { isRequired: updatePropertyDto.isRequired }),
          ...(updatePropertyDto.isVisible !== undefined && { isVisible: updatePropertyDto.isVisible }),
          ...(configToSave !== undefined && { config: configToSave as Prisma.InputJsonValue }),
        },
        tx,
      );
    });

    this.logger.log("Property updated", { id });
    return toPropertyResponseDto(property);
  }

  async remove(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Removing property", { id });

    const existingProperty = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!existingProperty) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    const property = await this.propertyRepo.delete(id);

    this.logger.log("Property removed", { id });
    return toPropertyResponseDto(property);
  }
}
