import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from "@fixspace/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { TemplateRepository } from "./template.repository";

@Injectable()
export class TemplateService {
  constructor(
    private readonly logger: AppLogger,
    private readonly templateRepo: TemplateRepository,
  ) {
    this.logger.setContext(TemplateService.name);
  }

  async create(databaseId: string, dto: CreateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Creating template", { databaseId });

    const database = await this.templateRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(`Database with id ${databaseId} not found`);
    }

    const properties = await this.templateRepo.findPropertiesByDatabase(databaseId);

    return await this.templateRepo.transaction(async (tx) => {
      const existingCount = await this.templateRepo.count(databaseId, tx);
      const isDefault = dto.isDefault ?? existingCount === 0;

      if (isDefault) {
        await this.templateRepo.updateMany({ databaseId, isDefault: true }, { isDefault: false }, tx);
      }

      const template = await this.templateRepo.create(
        {
          databaseId,
          name: dto.name ?? "Untitled",
          description: dto.description,
          icon: dto.icon,
          isDefault,
          position: dto.position ?? 0,
        },
        tx,
      );

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

      const createdTemplate = await this.templateRepo.findUniqueOrThrowWithValues(template.id, tx);

      return new TemplateResponseDto(createdTemplate);
    });
  }

  async findAll(databaseId: string, userId: string): Promise<TemplateResponseDto[]> {
    this.logger.debug("Finding all templates", { databaseId });

    const templates = await this.templateRepo.findAllByDatabase(databaseId, userId);

    return templates.map((t) => new TemplateResponseDto(t));
  }

  async findOne(id: string, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Finding template", { id });

    const template = await this.templateRepo.findByIdWithOwner(id, userId);

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const templateWithValues = await this.templateRepo.findUniqueOrThrowWithValues(id);

    return new TemplateResponseDto(templateWithValues);
  }

  async update(id: string, dto: UpdateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Updating template", { id });

    const existing = await this.templateRepo.findByIdWithOwner(id, userId);

    if (!existing) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const template = await this.templateRepo.transaction(async (tx) => {
      if (dto.isDefault) {
        await this.templateRepo.updateMany(
          { databaseId: existing.databaseId, isDefault: true },
          { isDefault: false },
          tx,
        );
      }

      const updated = await this.templateRepo.update(
        id,
        {
          name: dto.name,
          description: dto.description,
          icon: dto.icon,
          isDefault: dto.isDefault,
          position: dto.position,
        },
        { values: true },
        tx,
      );

      if (dto.isDefault === false) {
        const remaining = await this.templateRepo.findDefaultInDatabase(existing.databaseId, tx);
        if (!remaining) {
          const first = await this.templateRepo.findFirstInDatabase(existing.databaseId, tx);
          if (first) {
            await this.templateRepo.update(first.id, { isDefault: true }, undefined, tx);
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

    const existing = await this.templateRepo.findByIdWithOwner(id, userId);

    if (!existing) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const template = await this.templateRepo.transaction(async (tx) => {
      const deleted = await this.templateRepo.delete(id, { values: true }, tx);

      if (deleted.isDefault) {
        const next = await this.templateRepo.findFirstInDatabase(existing.databaseId, tx);
        if (next) {
          await this.templateRepo.update(next.id, { isDefault: true }, undefined, tx);
        }
      }

      return deleted;
    });

    this.logger.log("Template removed", { id });
    return new TemplateResponseDto(template);
  }
}
