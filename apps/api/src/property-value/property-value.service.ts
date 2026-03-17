import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@nucleus/database";
import {
  CreatePropertyValueDto,
  PropertyType,
  PropertyValueResponseDto,
  UpdatePropertyValueDto,
} from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../property/types";
import { PropertyValueRepository } from "./property-value.repository";

@Injectable()
export class PropertyValueService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly pvRepo: PropertyValueRepository,
  ) {
    this.logger.setContext(PropertyValueService.name);
  }

  private resolveHandlerAndConfig(property: { type: string; config: unknown }) {
    const type = property.type as PropertyType;
    const handler = this.typeRegistry.getValueHandler(type);
    const config =
      (property.config as Record<string, unknown> | null) ??
      this.typeRegistry.getConfigHandler(type).getDefaultConfig();
    return { handler, config };
  }

  async create(
    recordId: string,
    createPropertyValueDto: CreatePropertyValueDto,
    userId: string,
  ): Promise<PropertyValueResponseDto> {
    this.logger.debug("Creating property value", {
      recordId,
      propertyId: createPropertyValueDto.propertyId,
    });

    const record = await this.pvRepo.findRecordByOwner(recordId, userId);

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    const property = await this.pvRepo.findPropertyById(createPropertyValueDto.propertyId);

    if (!property) {
      throw new NotFoundException(`Property with id ${createPropertyValueDto.propertyId} not found`);
    }

    if (property.databaseId !== record.databaseId) {
      this.logger.warn("Property-record database mismatch", {
        propertyDatabaseId: property.databaseId,
        recordDatabaseId: record.databaseId,
      });
      throw new ConflictException("Property does not belong to the same database as the record");
    }

    const { handler, config } = this.resolveHandlerAndConfig(property);

    const rawValue =
      createPropertyValueDto.value !== undefined ? createPropertyValueDto.value : handler.getDefaultValue(config);

    const valueErrors = handler.validateValue(rawValue, config);
    if (valueErrors) {
      throw new BadRequestException(`Invalid value for property type ${property.type}: ${valueErrors.join("; ")}`);
    }

    const formattedValue = handler.formatValue(rawValue, config);

    const propertyValue = await this.pvRepo.upsert(
      recordId,
      createPropertyValueDto.propertyId,
      formattedValue as Prisma.InputJsonValue,
      createPropertyValueDto.computed ?? false,
    );

    this.logger.log("Property value created", {
      propertyValueId: propertyValue.id,
      recordId,
    });
    return new PropertyValueResponseDto(propertyValue);
  }

  async findAll(recordId: string, userId: string): Promise<PropertyValueResponseDto[]> {
    this.logger.debug("Finding all property values", { recordId });
    const propertyValues = await this.pvRepo.findAllByRecord(recordId, userId);
    return propertyValues.map((propertyValue) => new PropertyValueResponseDto(propertyValue));
  }

  async findOne(id: string, userId: string): Promise<PropertyValueResponseDto> {
    this.logger.debug("Finding property value", { id });

    const propertyValue = await this.pvRepo.findByIdWithOwner(id, userId);

    if (!propertyValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    return new PropertyValueResponseDto(propertyValue);
  }

  async update(
    id: string,
    updatePropertyValueDto: UpdatePropertyValueDto,
    userId: string,
  ): Promise<PropertyValueResponseDto> {
    this.logger.debug("Updating property value", { id });

    const existingValue = await this.pvRepo.findByIdWithOwner(id, userId);

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    let formattedValue: unknown = undefined;

    if (updatePropertyValueDto.value !== undefined) {
      const { handler, config } = this.resolveHandlerAndConfig(existingValue.property);

      const valueErrors = handler.validateValue(updatePropertyValueDto.value, config);
      if (valueErrors) {
        throw new BadRequestException(
          `Invalid value for property type ${existingValue.property.type}: ${valueErrors.join("; ")}`,
        );
      }

      formattedValue = handler.formatValue(updatePropertyValueDto.value, config);
    }

    const propertyValue = await this.pvRepo.update(id, {
      ...(formattedValue !== undefined && { value: formattedValue as Prisma.InputJsonValue }),
      ...(updatePropertyValueDto.computed !== undefined && { computed: updatePropertyValueDto.computed }),
    });

    this.logger.log("Property value updated", { id });
    return new PropertyValueResponseDto(propertyValue);
  }

  async remove(id: string, userId: string): Promise<PropertyValueResponseDto> {
    this.logger.debug("Removing property value", { id });

    const existingValue = await this.pvRepo.findByIdWithOwner(id, userId);

    if (!existingValue) {
      throw new NotFoundException(`PropertyValue with id ${id} not found`);
    }

    const propertyValue = await this.pvRepo.delete(id);

    this.logger.log("Property value removed", { id });
    return new PropertyValueResponseDto(propertyValue);
  }
}
