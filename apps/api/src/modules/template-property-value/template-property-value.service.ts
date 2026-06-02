import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import {
  CreateTemplatePropertyValueDto,
  PropertyType,
  TemplatePropertyValueResponseDto,
  UpdateTemplatePropertyValueDto,
} from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../property/types";
import { TemplatePropertyValueRepository } from "./repositories/template-property-value.repository";

@Injectable()
export class TemplatePropertyValueService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly tpvRepo: TemplatePropertyValueRepository,
  ) {
    this.logger.setContext(TemplatePropertyValueService.name);
  }

  private resolveHandlerAndConfig(property: { type: string; config: unknown }) {
    const type = property.type as PropertyType;
    const handler = this.typeRegistry.getValueHandler(type);
    const config =
      (property.config as Record<string, unknown> | null) ??
      this.typeRegistry.getConfigHandler(type).getDefaultConfig();
    return { handler, config };
  }

  async create(dto: CreateTemplatePropertyValueDto, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Creating template property value", {
      templateId: dto.templateId,
      propertyId: dto.propertyId,
    });

    const template = await this.tpvRepo.findTemplateByOwner(dto.templateId, userId);

    if (!template) {
      throw new NotFoundException(`Template with id ${dto.templateId} not found`);
    }

    const property = await this.tpvRepo.findPropertyById(dto.propertyId);

    if (!property) {
      throw new NotFoundException(`Property with id ${dto.propertyId} not found`);
    }

    if (property.databaseId !== template.databaseId) {
      this.logger.warn("Property-template database mismatch", {
        propertyDatabaseId: property.databaseId,
        templateDatabaseId: template.databaseId,
      });
      throw new ConflictException("Property does not belong to the same database as the template");
    }

    const { handler, config } = this.resolveHandlerAndConfig(property);

    const rawValue = dto.value !== undefined ? dto.value : handler.getDefaultValue(config);

    const valueErrors = handler.validateValue(rawValue, config);
    if (valueErrors) {
      throw new BadRequestException(`Invalid value for property type ${property.type}: ${valueErrors.join("; ")}`);
    }

    const formattedValue = handler.formatValue(rawValue, config);

    const templatePropertyValue = await this.tpvRepo.upsert(
      dto.templateId,
      dto.propertyId,
      formattedValue as Prisma.InputJsonValue,
    );

    this.logger.log("Template property value created", {
      templatePropertyValueId: templatePropertyValue.id,
      templateId: dto.templateId,
    });
    return new TemplatePropertyValueResponseDto(templatePropertyValue);
  }

  async findAll(templateId: string, userId: string): Promise<TemplatePropertyValueResponseDto[]> {
    this.logger.debug("Finding all template property values", { templateId });

    const values = await this.tpvRepo.findAllByTemplate(templateId, userId);

    return values.map((v) => new TemplatePropertyValueResponseDto(v));
  }

  async findOne(id: string, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Finding template property value", { id });

    const value = await this.tpvRepo.findByIdWithOwner(id, userId);

    if (!value) {
      throw new NotFoundException(`TemplatePropertyValue with id ${id} not found`);
    }

    return new TemplatePropertyValueResponseDto(value);
  }

  async update(
    id: string,
    dto: UpdateTemplatePropertyValueDto,
    userId: string,
  ): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Updating template property value", { id });

    const existing = await this.tpvRepo.findByIdWithOwner(id, userId);

    if (!existing) {
      throw new NotFoundException(`TemplatePropertyValue with id ${id} not found`);
    }

    let formattedValue: unknown = undefined;

    if (dto.value !== undefined) {
      const { handler, config } = this.resolveHandlerAndConfig(existing.property);

      const valueErrors = handler.validateValue(dto.value, config);
      if (valueErrors) {
        throw new BadRequestException(
          `Invalid value for property type ${existing.property.type}: ${valueErrors.join("; ")}`,
        );
      }

      formattedValue = handler.formatValue(dto.value, config);
    }

    const value = await this.tpvRepo.update(id, {
      ...(formattedValue !== undefined && { value: formattedValue as Prisma.InputJsonValue }),
    });

    this.logger.log("Template property value updated", { id });
    return new TemplatePropertyValueResponseDto(value);
  }

  async remove(id: string, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Removing template property value", { id });

    const existing = await this.tpvRepo.findByIdWithOwner(id, userId);

    if (!existing) {
      throw new NotFoundException(`TemplatePropertyValue with id ${id} not found`);
    }

    const value = await this.tpvRepo.delete(id);

    this.logger.log("Template property value removed", { id });
    return new TemplatePropertyValueResponseDto(value);
  }
}
