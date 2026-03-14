import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import {
  CreateTemplatePropertyValueDto,
  PropertyType,
  TemplatePropertyValueResponseDto,
  UpdateTemplatePropertyValueDto,
} from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../property/types";

@Injectable()
export class TemplatePropertyValueService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
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

    const template = await prisma.template.findFirst({
      where: {
        id: dto.templateId,
        database: { space: { ownerId: userId } },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${dto.templateId} not found`);
    }

    const property = await prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

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

    const templatePropertyValue = await prisma.templatePropertyValue.upsert({
      where: {
        templateId_propertyId: {
          templateId: dto.templateId,
          propertyId: dto.propertyId,
        },
      },
      update: {
        value: formattedValue as Prisma.InputJsonValue,
      },
      create: {
        templateId: dto.templateId,
        propertyId: dto.propertyId,
        value: formattedValue as Prisma.InputJsonValue,
      },
    });

    this.logger.log("Template property value created", {
      templatePropertyValueId: templatePropertyValue.id,
      templateId: dto.templateId,
    });
    return new TemplatePropertyValueResponseDto(templatePropertyValue);
  }

  async findAll(templateId: string, userId: string): Promise<TemplatePropertyValueResponseDto[]> {
    this.logger.debug("Finding all template property values", { templateId });

    const values = await prisma.templatePropertyValue.findMany({
      where: {
        templateId,
        template: {
          database: { space: { ownerId: userId } },
        },
      },
      include: { property: true },
    });

    return values.map((v) => new TemplatePropertyValueResponseDto(v));
  }

  async findOne(id: string, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Finding template property value", { id });

    const value = await prisma.templatePropertyValue.findFirst({
      where: {
        id,
        template: {
          database: { space: { ownerId: userId } },
        },
      },
      include: { property: true },
    });

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

    const existing = await prisma.templatePropertyValue.findFirst({
      where: {
        id,
        template: {
          database: { space: { ownerId: userId } },
        },
      },
      include: { property: true },
    });

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

    const value = await prisma.templatePropertyValue.update({
      where: { id },
      data: {
        ...(formattedValue !== undefined && { value: formattedValue as Prisma.InputJsonValue }),
      },
    });

    this.logger.log("Template property value updated", { id });
    return new TemplatePropertyValueResponseDto(value);
  }

  async remove(id: string, userId: string): Promise<TemplatePropertyValueResponseDto> {
    this.logger.debug("Removing template property value", { id });

    const existing = await prisma.templatePropertyValue.findFirst({
      where: {
        id,
        template: {
          database: { space: { ownerId: userId } },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`TemplatePropertyValue with id ${id} not found`);
    }

    const value = await prisma.templatePropertyValue.delete({ where: { id } });

    this.logger.log("Template property value removed", { id });
    return new TemplatePropertyValueResponseDto(value);
  }
}
