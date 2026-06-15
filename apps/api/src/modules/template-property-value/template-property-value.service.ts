import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateTemplatePropertyValueDto, TemplatePropertyValueResponseDto, UpdateTemplatePropertyValueDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { TemplateRepository } from "@/modules/template/repositories/template.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { TemplatePropertyValueRepository } from "./repositories/template-property-value.repository";

@Injectable()
export class TemplatePropertyValueService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly templatePropertyValueRepo: TemplatePropertyValueRepository,
    private readonly templateRepo: TemplateRepository,
    private readonly propertyRepo: PropertyRepository,
  ) {
    this.logger.setContext(TemplatePropertyValueService.name);
  }

  async create(createDto: CreateTemplatePropertyValueDto, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Creating template property value", {
      templateId: createDto.templateId,
      propertyId: createDto.propertyId,
    });

    const template = await this.templateRepo.findByIdWithOwner(createDto.templateId, userId);

    if (!template) {
      throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
    }

    const property = await this.propertyRepo.findById(createDto.propertyId);

    if (!property) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id: createDto.propertyId }));
    }

    if (property.databaseId !== template.databaseId) {
      this.logger.warn("Property-template database mismatch", {
        propertyDatabaseId: property.databaseId,
        templateDatabaseId: template.databaseId,
      });
      throw new ConflictException(t("errors.PROPERTY_NOT_BELONG_TO_DATABASE"));
    }

    const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);

    const rawValue = createDto.value !== undefined ? createDto.value : handler.getDefaultValue(config);

    const valueErrors = handler.validateValue(rawValue, config);
    if (valueErrors) {
      throw new BadRequestException(t("errors.INVALID_PROPERTY_VALUE", { type: property.type, errors: valueErrors.join("; ") }));
    }

    const formattedValue = handler.formatValue(rawValue, config);

    const result = await this.templatePropertyValueRepo.upsert(
      createDto.templateId,
      createDto.propertyId,
      formattedValue as Prisma.InputJsonValue,
    );

    this.logger.log("Template property value created", {
      id: result.id,
      templateId: createDto.templateId,
    });
    return new TemplatePropertyValueResponseDto(result as unknown as Partial<TemplatePropertyValueResponseDto>);
  }

  async findAll(templateId: string, userId: string): Promise<TemplatePropertyValueResponseDto[]> {
    this.logger.debug("Finding all template property values", { templateId });
    const values = await this.templatePropertyValueRepo.findAllByTemplate(templateId, userId);
    return values.map((value) => new TemplatePropertyValueResponseDto(value as unknown as Partial<TemplatePropertyValueResponseDto>));
  }

  async findOne(id: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Finding template property value", { id });

    const value = await this.templatePropertyValueRepo.findById(id);

    if (!value) {
      throw new NotFoundException(t("errors.TEMPLATE_PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    return new TemplatePropertyValueResponseDto(value as unknown as Partial<TemplatePropertyValueResponseDto>);
  }

  async update(id: string, updateDto: UpdateTemplatePropertyValueDto): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Updating template property value", { id });

    const existing = await this.templatePropertyValueRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(t("errors.TEMPLATE_PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    let formattedValue: unknown = undefined;

    if (updateDto.value !== undefined) {
      const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(existing.property);

      const valueErrors = handler.validateValue(updateDto.value, config);
      if (valueErrors) {
        throw new BadRequestException(t("errors.INVALID_PROPERTY_VALUE", { type: existing.property.type, errors: valueErrors.join("; ") }));
      }

      formattedValue = handler.formatValue(updateDto.value, config);
    }

    const updateData = filterUndefined({
      jsonFields: { value: formattedValue },
    });

    const result = await this.templatePropertyValueRepo.update(id, updateData);

    this.logger.log("Template property value updated", { id });
    return new TemplatePropertyValueResponseDto(result as unknown as Partial<TemplatePropertyValueResponseDto>);
  }

  async remove(id: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Removing template property value", { id });

    const existing = await this.templatePropertyValueRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(t("errors.TEMPLATE_PROPERTY_VALUE_NOT_FOUND_ID", { id }));
    }

    const result = await this.templatePropertyValueRepo.delete(id);

    this.logger.log("Template property value removed", { id });
    return new TemplatePropertyValueResponseDto(result as unknown as Partial<TemplatePropertyValueResponseDto>);
  }
}
