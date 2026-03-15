import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
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
      const existingCount = await tx.template.count({ where: { databaseId } });
      const isDefault = dto.isDefault ?? existingCount === 0;

      if (isDefault) {
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
          isDefault,
          position: dto.position ?? 0,
        },
      });

      for (const property of properties) {
        await tx.templatePropertyValue.create({
          data: {
            templateId: template.id,
            propertyId: property.id,
            value: Prisma.JsonNull,
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

      const updated = await tx.template.update({
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

      if (dto.isDefault === false) {
        const remaining = await tx.template.findFirst({
          where: { databaseId: existing.databaseId, isDefault: true },
        });
        if (!remaining) {
          const first = await tx.template.findFirst({
            where: { databaseId: existing.databaseId },
            orderBy: { position: "asc" },
          });
          if (first) {
            await tx.template.update({ where: { id: first.id }, data: { isDefault: true } });
          }
        }
      }

      return updated;
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

    const template = await prisma.$transaction(async (tx) => {
      const deleted = await tx.template.delete({ where: { id }, include: { values: true } });

      if (deleted.isDefault) {
        const next = await tx.template.findFirst({
          where: { databaseId: existing.databaseId },
          orderBy: { position: "asc" },
        });
        if (next) {
          await tx.template.update({ where: { id: next.id }, data: { isDefault: true } });
        }
      }

      return deleted;
    });

    this.logger.log("Template removed", { id });
    return new TemplateResponseDto(template);
  }
}
