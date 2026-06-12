import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import type { AvailablePresetTypeDto, CreateViewDto, DatabaseResponseDto, DatabaseType, PropertyConfig } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { InitializationConfigService } from "@/core/config/initialization/initialization-config.service";
import { PropertyService } from "@/modules/property/property.service";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { TemplateService } from "@/modules/template/template.service";
import { ViewService } from "@/modules/view/view.service";
import { DatabaseService } from "../database.service";
import { DatabaseRepository } from "../repositories/database.repository";

@Injectable()
export class PresetRestoreService {
  constructor(
    private readonly logger: AppLogger,
    private readonly initConfig: InitializationConfigService,
    private readonly databaseService: DatabaseService,
    private readonly propertyService: PropertyService,
    private readonly templateService: TemplateService,
    private readonly viewService: ViewService,
    private readonly databaseRepo: DatabaseRepository,
    private readonly propertyRepo: PropertyRepository,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(PresetRestoreService.name);
  }

  async getAvailablePresetTypes(userId: string): Promise<AvailablePresetTypeDto[]> {
    const available: AvailablePresetTypeDto[] = [];
    const config = this.initConfig.getConfig();

    for (const dbTemplate of config.databases) {
      if (!dbTemplate.type) continue;
      const existing = await this.databaseRepo.findByTypeForOwner(dbTemplate.type, userId);
      if (!existing) {
        available.push({
          type: dbTemplate.type,
          title: dbTemplate.title,
          icon: dbTemplate.icon ?? "icon:Database",
        });
      }
    }

    return available;
  }

  async restore(userId: string, type: DatabaseType, spaceId: string, sectionId?: string): Promise<DatabaseResponseDto> {
    this.logger.debug("Restoring preset database", { userId, type });

    const config = this.initConfig.getConfig();
    const dbTemplate = config.databases.find((d) => d.type === type);

    if (!dbTemplate) {
      throw new BadRequestException(t("errors.UNKNOWN_PRESET_TYPE", { type }));
    }

    const existing = await this.databaseRepo.findByTypeForOwner(type, userId);
    if (existing) {
      throw new ConflictException(t("errors.PRESET_DATABASE_EXISTS", { type }));
    }

    const space = await this.spaceRepo.findOne(spaceId);
    if (!space || space.ownerId !== userId) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND"));
    }

    const created = await this.databaseService.create(
      spaceId,
      {
        spaceId,
        name: dbTemplate.name,
        title: dbTemplate.title,
        type: dbTemplate.type,
        icon: dbTemplate.icon,
        sectionId,
        isPreset: true,
        properties: [],
      },
      userId,
    );

    const databaseId = created.id;
    const dbProps = new Map<string, string>();

    const nonFormulaDefs = (dbTemplate.properties ?? []).filter((prop) => prop.type !== PropertyType.FORMULA);
    for (const propDef of nonFormulaDefs) {
      const propertyConfig = { ...propDef.config } as Record<string, unknown>;

      if (propDef.type === PropertyType.RELATION && propertyConfig.sourceDatabaseType) {
        const { sourceDatabaseType } = propertyConfig;
        const relatedDb = await this.databaseRepo.findByTypeForOwner(sourceDatabaseType as string, userId);
        if (relatedDb) {
          propertyConfig.relatedEntityId = relatedDb.id;
        }
        delete propertyConfig.sourceDatabaseType;
      }

      const property = await this.propertyService.create(
        databaseId,
        {
          databaseId,
          name: propDef.name,
          type: propDef.type,
          position: propDef.position,
          isVisible: propDef.isVisible ?? true,
          icon: propDef.icon,
          hint: propDef.hint,
          group: propDef.group,
          groupId: propDef.groupId,
          integrationKey: propDef.integrationKey,
          config: propertyConfig as unknown as PropertyConfig,
        },
        userId,
      );

      dbProps.set(property.name, property.id);
    }

    const formulaDefs = (dbTemplate.properties ?? []).filter((prop) => prop.type === PropertyType.FORMULA);
    for (const propDef of formulaDefs) {
      const formulaConfig = { ...propDef.config } as Record<string, unknown>;

      if (formulaConfig.expression) {
        formulaConfig.expression = (formulaConfig.expression as string).replace(/\{\{(.+?)\}\}/g, (_match: string, name: string) => {
          const key = name.trim();
          const propId = key.includes(".") ? undefined : dbProps.get(key);
          return propId ? `field_${propId.replace(/-/g, "_")}` : _match;
        });
      }

      await this.propertyService.create(
        databaseId,
        {
          databaseId,
          name: propDef.name,
          type: propDef.type,
          position: propDef.position,
          isVisible: propDef.isVisible ?? true,
          icon: propDef.icon,
          hint: propDef.hint,
          group: propDef.group,
          groupId: propDef.groupId,
          integrationKey: propDef.integrationKey,
          config: formulaConfig as unknown as PropertyConfig,
        },
        userId,
      );
    }

    const templateDefs = dbTemplate.templates ?? [];
    for (const templateDef of templateDefs) {
      await this.templateService.create(databaseId, { ...templateDef, databaseId }, userId);
    }

    const properties = await this.propertyRepo.findManyByDatabase(databaseId);
    const propByName = new Map(properties.map((p) => [p.name, p]));

    for (const viewDef of dbTemplate.views ?? []) {
      const filters = (viewDef.filters ?? []).map((filter: any) => {
        const propName = filter.propertyName as string | undefined;
        if (propName && propByName.has(propName)) {
          return { ...filter, propertyId: propByName.get(propName)!.id };
        }
        return filter;
      });

      const sort = (viewDef.sort ?? []).map((sortDef: any) => {
        const propName = sortDef.propertyName as string | undefined;
        if (propName && propByName.has(propName)) {
          return { ...sortDef, propertyId: propByName.get(propName)!.id };
        }
        return sortDef;
      });

      const groupBy = viewDef.groupBy && propByName.has(viewDef.groupBy) ? propByName.get(viewDef.groupBy)!.id : viewDef.groupBy;

      const hiddenColumns = (viewDef.hiddenColumns ?? []).map((colName: string) => {
        if (propByName.has(colName)) {
          return propByName.get(colName)!.id;
        }
        return colName;
      });

      await this.viewService.create(
        databaseId,
        {
          ...viewDef,
          databaseId,
          filters,
          sort,
          groupBy,
          hiddenColumns,
        } as unknown as CreateViewDto,
        userId,
      );
    }

    this.logger.log("Preset database restored", { userId, type, databaseId });
    return created;
  }
}
