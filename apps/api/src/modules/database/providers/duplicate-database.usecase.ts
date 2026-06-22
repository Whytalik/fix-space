import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { DuplicateDatabaseDto, DatabaseResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { DatabaseRepository } from "../repositories/database.repository";
import { toDatabaseResponseDto } from "../utils/to-database-response.util";

@Injectable()
export class DuplicateDatabaseUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(DuplicateDatabaseUseCase.name);
  }

  async execute(databaseId: string, userId: string, options: DuplicateDatabaseDto = {}): Promise<DatabaseResponseDto> {
    const source = await this.databaseRepo.findByIdForDuplicate(databaseId);

    if (!source) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    if (source.isKey) {
      throw new BadRequestException(t("errors.CANNOT_DUPLICATE_KEY_DATABASE"));
    }

    if (options.newName) {
      const existingDatabase = await this.databaseRepo.findByNameInSpace(options.newName, source.spaceId);
      if (existingDatabase) {
        throw new ConflictException(t("errors.DATABASE_NAME_TAKEN"));
      }
    }

    const newName = options.newName ?? (await this.databaseRepo.findUniqueName(source.name, source.spaceId));

    const result = await this.databaseRepo.transaction(async (transaction) => {
      const newDatabase = await transaction.database.create({
        data: {
          spaceId: source.spaceId,
          sectionId: source.sectionId,
          name: newName,
          icon: source.icon,
        },
      });

      const propertyIdMap = new Map<string, string>();

      if (options.includeProperties !== false) {
        const propertyMappings = await Promise.all(
          source.properties.map(async (property) => {
            const newProperty = await transaction.property.create({
              data: {
                name: property.name,
                type: property.type,
                position: property.position,
                icon: property.icon,
                isVisible: property.isVisible,
                databaseId: newDatabase.id,
                config: property.config as Prisma.InputJsonValue,
              },
            });
            return { originalId: property.id, newId: newProperty.id };
          }),
        );

        propertyMappings.forEach(({ originalId, newId }) => {
          propertyIdMap.set(originalId, newId);
        });
      }

      if (options.includeTemplates !== false) {
        await Promise.all(
          source.templates.map(async (template) => {
            const newTemplate = await transaction.template.create({
              data: {
                name: template.name,
                description: template.description,
                icon: template.icon,
                namePattern: template.namePattern,
                content: template.content as Prisma.InputJsonValue,
                isDefault: template.isDefault,
                position: template.position,
                databaseId: newDatabase.id,
              },
            });

            const valuesToCreate = template.values
              .filter((templateValue) => propertyIdMap.has(templateValue.propertyId))
              .map((templateValue) => ({
                templateId: newTemplate.id,
                propertyId: propertyIdMap.get(templateValue.propertyId) as string,
                value: templateValue.value as Prisma.InputJsonValue,
              }));

            if (valuesToCreate.length === 0) return;
            return transaction.templatePropertyValue.createMany({ data: valuesToCreate });
          }),
        );
      }

      await Promise.all(
        source.views.map((view) =>
          transaction.view.create({
            data: {
              databaseId: newDatabase.id,
              name: view.name,
              isLocked: view.isLocked,
              pageSize: view.pageSize,
              recordLimit: view.recordLimit,
              useDefaultTemplate: view.useDefaultTemplate,
              defaultTemplateId: view.defaultTemplateId,
              filters: view.filters as Prisma.InputJsonValue,
              filterLogic: view.filterLogic,
              sort: view.sort as Prisma.InputJsonValue,
              groupBy: view.groupBy,
              hiddenColumns: view.hiddenColumns,
              columnWidths: view.columnWidths as Prisma.InputJsonValue,
              textWrap: view.textWrap,
              searchQuery: view.searchQuery,
              config: view.config as Prisma.InputJsonValue,
            },
          }),
        ),
      );

      if (options.includeAutomations !== false) {
        await Promise.all(
          source.automations.map((automation) =>
            transaction.automation.create({
              data: {
                name: automation.name,
                trigger: automation.trigger,
                actions: automation.actions as Prisma.InputJsonValue,
                active: automation.active,
                config: automation.config as Prisma.InputJsonValue,
                databaseId: newDatabase.id,
              },
            }),
          ),
        );
      }

      if (options.includeRecords === true) {
        await Promise.all(
          source.records.map(async (record) => {
            const newRecord = await transaction.record.create({
              data: {
                databaseId: newDatabase.id,
                name: record.name,
                icon: record.icon,
              },
            });

            const valuesToCreate = record.values
              .filter((value) => propertyIdMap.has(value.propertyId))
              .map((value) => ({
                recordId: newRecord.id,
                propertyId: propertyIdMap.get(value.propertyId) as string,
                value: value.value as Prisma.InputJsonValue,
                computed: value.computed,
              }));

            if (valuesToCreate.length === 0) return;
            return transaction.propertyValue.createMany({ data: valuesToCreate });
          }),
        );
      }

      return toDatabaseResponseDto(newDatabase);
    });

    return result;
  }
}
