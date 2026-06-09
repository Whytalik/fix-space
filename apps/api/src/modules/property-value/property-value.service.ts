import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreatePropertyValueDto, PropertyValueResponseDto, UpdatePropertyValueDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { PropertyValueRepository } from "./repositories/property-value.repository";

@Injectable()
export class PropertyValueService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly propertyValueRepo: PropertyValueRepository,
  ) {
    this.logger.setContext(PropertyValueService.name);
  }

  async create(recordId: string, createPropertyValueDto: CreatePropertyValueDto, userId: string): Promise<PropertyValueResponseDto> {
    this.logger.debug("Creating property value", {
      recordId,
      propertyId: createPropertyValueDto.propertyId,
    });

    const record = await this.propertyValueRepo.findRecordByOwner(recordId, userId);

    if (!record) {
      throw new NotFoundException(t("errors.RECORD_NOT_FOUND_ID", { id: recordId }));
    }

    const property = await this.propertyValueRepo.findPropertyById(createPropertyValueDto.propertyId);

    if (!property) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id: createPropertyValueDto.propertyId }));
    }

    if (property.databaseId !== record.databaseId) {
      this.logger.warn("Property-record database mismatch", {
        propertyDatabaseId: property.databaseId,
        recordDatabaseId: record.databaseId,
      });
      throw new ConflictException(t("errors.PROPERTY_NOT_BELONG_TO_DATABASE"));
    }

    const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);

    const rawValue = createPropertyValueDto.value !== undefined ? createPropertyValueDto.value : handler.getDefaultValue(config);

    const valueErrors = handler.validateValue(rawValue, config);
    if (valueErrors) {
      throw new BadRequestException(t("errors.INVALID_PROPERTY_VALUE", { type: property.type, errors: valueErrors.join("; ") }));
    }

    const formattedValue = handler.formatValue(rawValue, config);

    const propertyValue = await this.propertyValueRepo.upsert(
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
    const propertyValues = await this.propertyValueRepo.findAllByRecord(recordId, userId);
    return propertyValues.map((propertyValue) => new PropertyValueResponseDto(propertyValue));
  }

  async findOne(id: string): Promise<PropertyValueResponseDto> {
    this.logger.debug("Finding property value", { id });

    const propertyValue = await this.propertyValueRepo.findById(id);

    if (!propertyValue) {
      throw new NotFoundException(t("errors.PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    return new PropertyValueResponseDto(propertyValue);
  }

  async update(id: string, updatePropertyValueDto: UpdatePropertyValueDto): Promise<PropertyValueResponseDto> {
    this.logger.debug("Updating property value", { id });

    const existingValue = await this.propertyValueRepo.findById(id);

    if (!existingValue) {
      throw new NotFoundException(t("errors.PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    let formattedValue: unknown = undefined;

    if (updatePropertyValueDto.value !== undefined) {
      const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(existingValue.property);

      const valueErrors = handler.validateValue(updatePropertyValueDto.value, config);
      if (valueErrors) {
        throw new BadRequestException(
          t("errors.INVALID_PROPERTY_VALUE", { type: existingValue.property.type, errors: valueErrors.join("; ") }),
        );
      }

      formattedValue = handler.formatValue(updatePropertyValueDto.value, config);
    }

    const updateData = filterUndefined({
      fields: { computed: updatePropertyValueDto.computed },
      jsonFields: { value: formattedValue },
    });

    const propertyValue = await this.propertyValueRepo.update(id, updateData);

    this.logger.log("Property value updated", { id });
    return new PropertyValueResponseDto(propertyValue);
  }

  async remove(id: string): Promise<PropertyValueResponseDto> {
    this.logger.debug("Removing property value", { id });

    const existingValue = await this.propertyValueRepo.findById(id);

    if (!existingValue) {
      throw new NotFoundException(t("errors.PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    const propertyValue = await this.propertyValueRepo.delete(id);

    this.logger.log("Property value removed", { id });
    return new PropertyValueResponseDto(propertyValue);
  }
}
