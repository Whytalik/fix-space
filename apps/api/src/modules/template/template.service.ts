import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { TemplateRepository } from "./repositories/template.repository";

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
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    const properties = await this.templateRepo.findPropertiesByDatabase(databaseId);

    return await this.templateRepo.transaction(async (transaction) => {
      const existingCount = await this.templateRepo.count(databaseId, transaction);
      const isDefault = dto.isDefault ?? existingCount === 0;

      if (isDefault) {
        await this.templateRepo.updateMany({ databaseId, isDefault: true }, { isDefault: false }, transaction);
      }

      const template = await this.templateRepo.create(
        {
          databaseId,
          name: dto.name ?? "Untitled",
          description: dto.description,
          icon: dto.icon,
          namePattern: dto.namePattern,
          isDefault,
          position: dto.position ?? 0,
          content: (dto.content as any) ?? {},
          config: (dto.config as any) ?? {},
        },
        transaction,
      );

      for (const property of properties) {
        await transaction.templatePropertyValue.create({
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

      const createdTemplate = await this.templateRepo.findUniqueOrThrowWithValues(template.id, transaction);
      return new TemplateResponseDto(createdTemplate as unknown as Partial<TemplateResponseDto>);
    });
  }

  async findAll(databaseId: string, userId: string): Promise<TemplateResponseDto[]> {
    this.logger.debug("Finding all templates", { databaseId });
    const templates = await this.templateRepo.findAllByDatabase(databaseId, userId);
    return templates.map((template) => new TemplateResponseDto(template as unknown as Partial<TemplateResponseDto>));
  }

  async findOne(id: string): Promise<TemplateResponseDto> {
    this.logger.debug("Finding template", { id });

    const template = await this.templateRepo.findByIdWithValues(id);

    if (!template) {
      throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
    }

    return new TemplateResponseDto(template as unknown as Partial<TemplateResponseDto>);
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    this.logger.debug("Updating template", { id });

    const existing = await this.templateRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
    }

    const template = await this.templateRepo.transaction(async (transaction) => {
      if (updateTemplateDto.isDefault) {
        await this.templateRepo.updateMany({ databaseId: existing.databaseId, isDefault: true }, { isDefault: false }, transaction);
      }

      const updateData = filterUndefined({
        fields: {
          name: updateTemplateDto.name,
          description: updateTemplateDto.description,
          icon: updateTemplateDto.icon,
          namePattern: updateTemplateDto.namePattern,
          isDefault: updateTemplateDto.isDefault,
          position: updateTemplateDto.position,
        },
        jsonFields: {
          content: updateTemplateDto.content,
          config: updateTemplateDto.config,
        },
      });

      const updated = await this.templateRepo.update(id, updateData, { values: true }, transaction);

      if (updateTemplateDto.isDefault === false) {
        const remaining = await this.templateRepo.findDefaultInDatabase(existing.databaseId, transaction);
        if (!remaining) {
          const first = await this.templateRepo.findFirstInDatabase(existing.databaseId, transaction);
          if (first) {
            await this.templateRepo.update(first.id, { isDefault: true }, undefined, transaction);
          }
        }
      }

      return updated;
    });

    this.logger.log("Template updated", { id });
    return new TemplateResponseDto(template as unknown as Partial<TemplateResponseDto>);
  }

  async remove(id: string): Promise<TemplateResponseDto> {
    this.logger.debug("Removing template", { id });

    const existing = await this.templateRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
    }

    const template = await this.templateRepo.transaction(async (transaction) => {
      const deleted = await this.templateRepo.delete(id, { values: true }, transaction);

      if (deleted.isDefault) {
        const next = await this.templateRepo.findFirstInDatabase(existing.databaseId, transaction);
        if (next) {
          await this.templateRepo.update(next.id, { isDefault: true }, undefined, transaction);
        }
      }

      return deleted;
    });

    this.logger.log("Template removed", { id });
    return new TemplateResponseDto(template as unknown as Partial<TemplateResponseDto>);
  }

  async reset(id: string): Promise<TemplateResponseDto> {
    this.logger.debug("Resetting template", { id });
    const existing = await this.templateRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(t("errors.TEMPLATE_NOT_FOUND"));
    }

    return this.templateRepo.transaction(async (transaction) => {
      await transaction.templatePropertyValue.deleteMany({
        where: { templateId: id },
      });

      const properties = await transaction.property.findMany({
        where: { databaseId: existing.databaseId },
      });

      if (properties.length > 0) {
        await transaction.templatePropertyValue.createMany({
          data: properties.map((p) => ({
            templateId: id,
            propertyId: p.id,
            value: Prisma.DbNull,
          })),
        });
      }

      const updated = await this.templateRepo.update(id, { content: {}, config: {} }, undefined, transaction);

      this.logger.log("Template reset", { id });
      return new TemplateResponseDto(updated as unknown as Partial<TemplateResponseDto>);
    });
  }
}
