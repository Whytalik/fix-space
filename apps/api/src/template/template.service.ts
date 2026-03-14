import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@nucleus/database";
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";

@Injectable()
export class TemplateService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(TemplateService.name);
  }

  async create(databaseId: string, dto: CreateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Creating template", { databaseId });

    const database = await prisma.database.findFirst({
      where: {
        id: databaseId,
        space: { ownerId: userId },
      },
    });

    if (!database) {
      throw new NotFoundException(`Database with id ${databaseId} not found`);
    }

    const properties = await prisma.property.findMany({
      where: { databaseId },
    });

    return await prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.template.updateMany({
          where: { databaseId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const template = await tx.template.create({
        data: {
          databaseId,
          name: dto.name ?? "Untitled",
          description: dto.description,
          icon: dto.icon,
          isDefault: dto.isDefault ?? false,
          position: dto.position ?? 0,
        },
      });

      for (const property of properties) {
        await tx.templatePropertyValue.create({
          data: {
            templateId: template.id,
            propertyId: property.id,
            value: null,
          },
        });
      }

      this.logger.log("Template created with property values", {
        templateId: template.id,
        databaseId,
        propertyCount: properties.length,
      });

      const createdTemplate = await tx.template.findUniqueOrThrow({
        where: { id: template.id },
        include: { values: true },
      });

      return new TemplateResponseDto(createdTemplate);
    });
  }

  async findAll(databaseId: string, userId: string): Promise<TemplateResponseDto[]> {
    this.logger.debug("Finding all templates", { databaseId });

    const templates = await prisma.template.findMany({
      where: {
        databaseId,
        database: { space: { ownerId: userId } },
      },
      include: { values: true },
      orderBy: { position: "asc" },
    });

    return templates.map((t) => new TemplateResponseDto(t));
  }

  async findOne(id: string, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Finding template", { id });

    const template = await prisma.template.findFirst({
      where: {
        id,
        database: { space: { ownerId: userId } },
      },
      include: { values: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    return new TemplateResponseDto(template);
  }

  async update(id: string, dto: UpdateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Updating template", { id });

    const existing = await prisma.template.findFirst({
      where: {
        id,
        database: { space: { ownerId: userId } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const template = await prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.template.updateMany({
          where: { databaseId: existing.databaseId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.template.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          icon: dto.icon,
          isDefault: dto.isDefault,
          position: dto.position,
        },
        include: { values: true },
      });
    });

    this.logger.log("Template updated", { id });
    return new TemplateResponseDto(template);
  }

  async remove(id: string, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Removing template", { id });

    const existing = await prisma.template.findFirst({
      where: {
        id,
        database: { space: { ownerId: userId } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const template = await prisma.template.delete({ where: { id }, include: { values: true } });

    this.logger.log("Template removed", { id });
    return new TemplateResponseDto(template);
  }
}
