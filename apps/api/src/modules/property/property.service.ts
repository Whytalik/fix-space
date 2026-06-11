import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import {
  CreatePropertyDto,
  isRelationPropertyConfig,
  isStatusPropertyConfig,
  PropertyResponseDto,
  PropertyType,
  UpdatePropertyDto,
  FormulaPropertyConfig,
} from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { PropertyRepository } from "./repositories/property.repository";
import { ViewRepository } from "@/modules/view/repositories/view.repository";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { FormulaRecalculator } from "./types/formula/formula-recalculator.service";
import { FormulaEngine } from "./types/formula/formula-engine.service";
import { PropertyTypeRegistry } from "./types";
import { toPropertyResponseDto } from "./utils/to-property-response.dto";

@Injectable()
export class PropertyService {
  constructor(
    private readonly logger: AppLogger,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly formulaRecalculator: FormulaRecalculator,
    private readonly formulaEngine: FormulaEngine,
    private readonly propertyRepo: PropertyRepository,
    private readonly viewRepo: ViewRepository,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(PropertyService.name);
  }

  private isProtectedProperty(property: { isProtected: boolean }): boolean {
    return property.isProtected === true;
  }

  private isNameProperty(property: { name: string }): boolean {
    return property.name === "Name";
  }

  private async checkBrokenRelation(property: { type: string; config: unknown }): Promise<boolean> {
    if (property.type !== PropertyType.RELATION) return false;
    if (!isRelationPropertyConfig(property.config)) return false;
    if (!property.config.relatedEntityId) return false;

    const targetExists = await this.databaseRepo.exists(property.config.relatedEntityId);
    return !targetExists;
  }

  private async checkPropertyDependencies(databaseId: string, propertyId: string) {
    const views = await this.viewRepo.findAllByDatabase(databaseId);
    const dependentViews = views.filter((view) => {
      if (view.groupBy === propertyId) return true;

      if (view.filters) {
        const filters = view.filters as any;
        if (filters && Array.isArray(filters)) {
          if (filters.some((filter: any) => filter.propertyId === propertyId)) return true;
        } else if (filters?.propertyId === propertyId) return true;
      }

      if (view.sort) {
        const sort = view.sort as any;
        if (sort && Array.isArray(sort)) {
          if (sort.some((sortItem: any) => sortItem.propertyId === propertyId)) return true;
        } else if (sort?.propertyId === propertyId) return true;
      }
      return false;
    });

    if (dependentViews.length > 0) {
      throw new ConflictException(t("errors.PROPERTY_HAS_DEPENDENCIES", { views: dependentViews.map((view) => view.name).join(", ") }));
    }
  }

  async create(databaseId: string, createPropertyDto: CreatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Creating property", {
      databaseId,
      name: createPropertyDto.name,
    });

    const database = await this.databaseRepo.findDatabaseByOwner(databaseId, userId);

    if (!database) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    if (database.isLocked) {
      throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));
    }

    const isPropertyNameTaken = await this.propertyRepo.findByNameInDatabase(createPropertyDto.name, databaseId);

    if (isPropertyNameTaken) {
      this.logger.warn("Duplicate property name", {
        databaseId,
        name: createPropertyDto.name,
      });
      throw new ConflictException(t("errors.PROPERTY_NAME_TAKEN"));
    }

    const handler = this.typeRegistry.getConfigHandler(createPropertyDto.type);
    const defaultConfig = handler.getDefaultConfig();
    const mergedConfig = createPropertyDto.config
      ? {
          ...defaultConfig,
          ...(createPropertyDto.config as unknown as Record<string, unknown>),
        }
      : defaultConfig;

    const configErrors = handler.validateConfig(mergedConfig);
    if (configErrors) {
      throw new BadRequestException(t("errors.INVALID_CONFIG", { type: createPropertyDto.type, errors: configErrors.join("; ") }));
    }

    const property = await this.propertyRepo.transaction(async (transaction) => {
      const created = await this.propertyRepo.create(
        {
          name: createPropertyDto.name,
          type: createPropertyDto.type,
          position: createPropertyDto.position,
          icon: createPropertyDto.icon,
          hint: createPropertyDto.hint,
          group: createPropertyDto.group,
          isVisible: createPropertyDto.isVisible ?? true,
          databaseId,
          config: mergedConfig as Prisma.InputJsonValue,
        } as Prisma.PropertyUncheckedCreateInput,
        transaction,
      );

      const existingRecords = await transaction.record.findMany({
        where: {
          databaseId,
        },
        select: {
          id: true,
        },
      });

      if (existingRecords.length > 0) {
        await transaction.propertyValue.createMany({
          data: existingRecords.map((record) => ({
            recordId: record.id,
            propertyId: created.id,
            value: Prisma.DbNull,
            computed: created.type === PropertyType.FORMULA,
          })),
        });

        if (created.type === PropertyType.FORMULA) {
          for (const record of existingRecords) {
            await this.formulaRecalculator.recalculate(record.id, databaseId, transaction);
          }
        }
      }

      const existingTemplates = await transaction.template.findMany({
        where: {
          databaseId,
        },
        select: {
          id: true,
        },
      });

      if (existingTemplates.length > 0) {
        await transaction.templatePropertyValue.createMany({
          data: existingTemplates.map((template) => ({
            templateId: template.id,
            propertyId: created.id,
            value: Prisma.DbNull,
          })),
        });
      }

      return created;
    });

    this.logger.log("Property created", {
      propertyId: property.id,
      databaseId,
    });
    return toPropertyResponseDto(property);
  }

  async findAll(databaseId: string, userId: string): Promise<PropertyResponseDto[]> {
    this.logger.debug("Finding all properties", { databaseId });
    const properties = await this.propertyRepo.findAllByDatabase(databaseId, userId);

    return Promise.all(
      properties.map(async (property) => {
        const isBroken = await this.checkBrokenRelation(property);
        if (isBroken) {
          (property.config as any) = { ...(property.config as any), isBroken: true };
        }
        return toPropertyResponseDto(property);
      }),
    );
  }

  async findOne(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Finding property", { id });

    const property = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!property) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    return toPropertyResponseDto(property);
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Updating property", { id });

    const existingProperty = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!existingProperty) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    const database = await this.databaseRepo.findDatabaseByOwner(existingProperty.databaseId, userId);
    if (database?.isLocked) {
      throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));
    }

    const isProtected = this.isProtectedProperty(existingProperty) || this.isNameProperty(existingProperty);

    if (updatePropertyDto.name && updatePropertyDto.name !== existingProperty.name) {
      if (isProtected) {
        throw new ForbiddenException(t("errors.CANNOT_RENAME_NAME_PROPERTY"));
      }
      const isPropertyNameTaken = await this.propertyRepo.findByNameExcluding(updatePropertyDto.name, existingProperty.databaseId, id);

      if (isPropertyNameTaken) {
        this.logger.warn("Duplicate property name on update", {
          id,
          name: updatePropertyDto.name,
        });
        throw new ConflictException(t("errors.PROPERTY_NAME_TAKEN"));
      }
    }

    if (updatePropertyDto.position !== undefined && updatePropertyDto.position !== existingProperty.position) {
      if (isProtected) {
        throw new ForbiddenException(t("errors.CANNOT_CHANGE_POSITION_NAME_PROPERTY"));
      }
    }

    if (updatePropertyDto.type && updatePropertyDto.type !== existingProperty.type) {
      if (isProtected) {
        throw new ForbiddenException(t("errors.CANNOT_CHANGE_TYPE_NAME_PROPERTY"));
      }
    }

    if (updatePropertyDto.group !== undefined && updatePropertyDto.group !== existingProperty.group) {
      if (isProtected && updatePropertyDto.group !== "General") {
        throw new ForbiddenException(t("errors.CANNOT_CHANGE_GROUP_NAME_PROPERTY"));
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
        ...(updatePropertyDto.config as unknown as Record<string, unknown>),
      };
      const configErrors = handler.validateConfig(merged);
      if (configErrors) {
        throw new BadRequestException(t("errors.INVALID_CONFIG", { type: effectiveType, errors: configErrors.join("; ") }));
      }
      configToSave = merged;
    }

    const typeChanged = updatePropertyDto.type !== undefined && updatePropertyDto.type !== existingProperty.type;
    const configChanged = updatePropertyDto.config !== undefined;

    const updateData = filterUndefined({
      fields: {
        name: updatePropertyDto.name,
        type: updatePropertyDto.type,
        position: updatePropertyDto.position,
        icon: updatePropertyDto.icon,
        hint: updatePropertyDto.hint,
        isVisible: updatePropertyDto.isVisible,
      },
      jsonFields: { config: configToSave },
      nullableFields: { group: updatePropertyDto.group },
    });

    const property = await this.propertyRepo.transaction(async (transaction) => {
      if (typeChanged) {
        const fromType = existingProperty.type as PropertyType;
        const fromConfig = (existingProperty.config as Record<string, unknown>) ?? {};
        const toConfig = configToSave ?? {};
        const valueHandler = this.typeRegistry.getValueHandler(updatePropertyDto.type!);

        const [propertyValues, templatePropertyValues] = await Promise.all([
          transaction.propertyValue.findMany({ where: { propertyId: id }, select: { id: true, value: true } }),
          transaction.templatePropertyValue.findMany({ where: { propertyId: id }, select: { id: true, value: true } }),
        ]);

        await Promise.all([
          ...propertyValues.map((propertyValue) => {
            const converted = valueHandler.convertFrom(propertyValue.value, fromType, fromConfig, toConfig);
            return transaction.propertyValue.update({
              where: { id: propertyValue.id },
              data: {
                value: converted !== null && converted !== undefined ? (converted as Prisma.InputJsonValue) : Prisma.DbNull,
                computed: updatePropertyDto.type === PropertyType.FORMULA,
              },
            });
          }),
          ...templatePropertyValues.map((templatePropertyValue) => {
            const converted = valueHandler.convertFrom(templatePropertyValue.value, fromType, fromConfig, toConfig);
            return transaction.templatePropertyValue.update({
              where: { id: templatePropertyValue.id },
              data: { value: converted !== null && converted !== undefined ? (converted as Prisma.InputJsonValue) : Prisma.DbNull },
            });
          }),
        ]);
      } else if (existingProperty.type === PropertyType.STATUS && updatePropertyDto.config) {
        const oldConfig = existingProperty.config as Record<string, unknown>;
        const newConfig = configToSave as Record<string, unknown>;

        if (isStatusPropertyConfig(oldConfig) && isStatusPropertyConfig(newConfig)) {
          const oldOptions = new Set(oldConfig.categories.flatMap((category) => category.options.map((option) => option.name)));
          const newOptions = new Set(newConfig.categories.flatMap((category) => category.options.map((option) => option.name)));
          const deletedOptions = [...oldOptions].filter((option) => !newOptions.has(option));

          for (const deletedOption of deletedOptions) {
            const oldCategory = oldConfig.categories.find((category) => category.options.some((option) => option.name === deletedOption));
            const newCategoryDefault = newConfig.categories.find((category) => category.category === oldCategory?.category)?.defaultOption;

            if (newCategoryDefault) {
              await transaction.propertyValue.updateMany({
                where: { propertyId: id, value: { equals: deletedOption as Prisma.InputJsonValue } },
                data: { value: newCategoryDefault as Prisma.InputJsonValue },
              });
            }
          }
        }
      }

      const updated = await this.propertyRepo.update(id, updateData, transaction);

      if (updated.type === PropertyType.FORMULA && (typeChanged || configChanged)) {
        const records = await transaction.record.findMany({
          where: { databaseId: updated.databaseId },
          select: { id: true },
        });
        for (const record of records) {
          await this.formulaRecalculator.recalculate(record.id, updated.databaseId, transaction);
        }
      }

      return updated;
    });

    this.logger.log("Property updated", { id });
    return toPropertyResponseDto(property);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.debug("Removing property", { id });

    const property = await this.propertyRepo.findByIdWithOwner(id, userId);
    if (!property) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    if (this.isProtectedProperty(property) || this.isNameProperty(property)) {
      throw new ForbiddenException(t("errors.CANNOT_DELETE_NAME_PROPERTY"));
    }

    await this.propertyRepo.delete(id);
    this.logger.log("Property removed", { id });
  }

  previewFormula(propertyId: string, config: FormulaPropertyConfig, recordValues: Record<string, unknown>): { result: unknown } {
    this.logger.debug("Previewing formula", { propertyId });
    const result = this.formulaEngine.evaluate(config, recordValues);
    return { result };
  }

  async previewFormulaForDatabase(databaseId: string, config: FormulaPropertyConfig): Promise<{ result: unknown; isSample: boolean }> {
    this.logger.debug("Previewing formula for database", { databaseId });
    return this.formulaRecalculator.previewForDatabase(databaseId, config);
  }

  async duplicate(id: string, userId: string): Promise<PropertyResponseDto> {
    this.logger.debug("Duplicating property", { id });

    const existingProperty = await this.propertyRepo.findByIdWithOwner(id, userId);

    if (!existingProperty) {
      throw new NotFoundException(t("errors.PROPERTY_NOT_FOUND_ID", { id }));
    }

    const database = await this.databaseRepo.findDatabaseByOwner(existingProperty.databaseId, userId);
    if (database?.isLocked) {
      throw new ForbiddenException(t("errors.DATABASE_STRUCTURE_LOCKED"));
    }

    const newName = `${existingProperty.name} (copy)`;

    const duplicatedProperty = await this.propertyRepo.transaction(async (transaction) => {
      const created = await this.propertyRepo.create(
        {
          name: newName,
          type: existingProperty.type,
          position: existingProperty.position + 1,
          icon: existingProperty.icon,
          hint: existingProperty.hint,
          group: existingProperty.group,
          isVisible: existingProperty.isVisible,
          databaseId: existingProperty.databaseId,
          config: existingProperty.config as Prisma.InputJsonValue,
          groupId: existingProperty.groupId,
        } as Prisma.PropertyUncheckedCreateInput,
        transaction,
      );

      const existingRecords = await transaction.record.findMany({
        where: { databaseId: existingProperty.databaseId },
        select: { id: true },
      });

      if (existingRecords.length > 0) {
        await transaction.propertyValue.createMany({
          data: existingRecords.map((record) => ({
            recordId: record.id,
            propertyId: created.id,
            value: Prisma.DbNull,
            computed: created.type === PropertyType.FORMULA,
          })),
        });

        if (created.type === PropertyType.FORMULA) {
          for (const record of existingRecords) {
            await this.formulaRecalculator.recalculate(record.id, existingProperty.databaseId, transaction);
          }
        }
      }

      return created;
    });

    this.logger.log("Property duplicated", { id, newPropertyId: duplicatedProperty.id });
    return toPropertyResponseDto(duplicatedProperty);
  }
}
