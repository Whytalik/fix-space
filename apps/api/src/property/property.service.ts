import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { CreatePropertyDto, PropertyResponseDto, PropertyType, UpdatePropertyDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "./types";

@Injectable()
export class PropertyService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(PropertyService.name);
  }

  async create(databaseId: string, createPropertyDto: CreatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Creating property", {
      databaseId,
      name: createPropertyDto.name,
    });

    const database = await prisma.database.findFirst({
      where: {
        id: databaseId,
        space: {
          ownerId: userId,
        },
      },
    });

    if (!database) {
      throw new NotFoundException(`Database not found`);
    }

    const isPropertyNameTaken = await prisma.property.findFirst({
      where: {
        name: createPropertyDto.name,
        databaseId,
      },
    });

    if (isPropertyNameTaken) {
      this.logger.warn("Duplicate property name", {
        databaseId,
        name: createPropertyDto.name,
      });
      throw new ConflictException("Property name is already taken in this database.");
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
      throw new BadRequestException(`Invalid config for ${createPropertyDto.type}: ${configErrors.join("; ")}`);
    }

    const [property] = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
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
        },
      });

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
    return new PropertyResponseDto({ ...property, type: property.type as PropertyType });
  }

  async findAll(databaseId: string, userId: string): Promise<PropertyResponseDto[]> {
    this.logger.debug("Finding all properties", { databaseId });
    const properties = await prisma.property.findMany({
      where: {
        databaseId,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });
    return properties.map((property) => new PropertyResponseDto({ ...property, type: property.type as PropertyType }));
  }

  async findOne(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Finding property", { id });

    const property = await prisma.property.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return new PropertyResponseDto({ ...property, type: property.type as PropertyType });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Updating property", { id });

    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    if (updatePropertyDto.name && updatePropertyDto.name !== existingProperty.name) {
      const isPropertyNameTaken = await prisma.property.findFirst({
        where: {
          name: updatePropertyDto.name,
          databaseId: existingProperty.databaseId,
          NOT: { id },
        },
      });

      if (isPropertyNameTaken) {
        this.logger.warn("Duplicate property name on update", {
          id,
          name: updatePropertyDto.name,
        });
        throw new ConflictException("Property name is already taken in this database.");
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
        throw new BadRequestException(`Invalid config for ${effectiveType}: ${configErrors.join("; ")}`);
      }
      configToSave = merged;
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
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
    });

    this.logger.log("Property updated", { id });
    return new PropertyResponseDto({ ...property, type: property.type as PropertyType });
  }

  async remove(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Removing property", { id });

    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        database: {
          space: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const property = await prisma.property.delete({
      where: { id },
    });

    this.logger.log("Property removed", { id });
    return new PropertyResponseDto({ ...property, type: property.type as PropertyType });
  }
}
