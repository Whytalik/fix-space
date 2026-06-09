import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { DuplicateDatabaseDto, DatabaseResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { DatabaseRepository } from "../repositories/database.repository";
import { generateUniqueName, generateUniqueSlug } from "@/common/utils/generate-unique-name";
import { toDatabaseResponseDto } from "../utils/to-database-response.util";

@Injectable()
export class DuplicateDatabaseUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(DuplicateDatabaseUseCase.name);
  }

  async execute(databaseId: string, options: DuplicateDatabaseDto = {}): Promise<DatabaseResponseDto> {
    const source = await this.databaseRepo.findByIdForDuplicate(databaseId);

    if (!source) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    const newTitle = options.newName ?? generateUniqueName(source.title);

    return this.databaseRepo.transaction(async (transaction) => {
      const newDatabase = await transaction.database.create({
        data: {
          spaceId: source.spaceId,
          sectionId: source.sectionId,
          name: generateUniqueSlug(source.name),
          title: newTitle,
          icon: source.icon,
        },
      });

      const propertyIdMap = new Map<string, string>();

      if (options.includeProperties !== false) {
        for (const property of source.properties) {
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

          propertyIdMap.set(property.id, newProperty.id);
        }
      }

      if (options.includeTemplates !== false) {
        for (const template of source.templates) {
          const newTemplate = await transaction.template.create({
            data: {
              name: template.name,
              description: template.description,
              icon: template.icon,
              namePattern: template.namePattern,
              content: template.content as Prisma.InputJsonValue,
              isDefault: template.isDefault,
              position: template.position,
              config: template.config as Prisma.InputJsonValue,
              databaseId: newDatabase.id,
            },
          });

          for (const templateValue of template.values) {
            const newPropertyId = propertyIdMap.get(templateValue.propertyId);
            if (newPropertyId) {
              await transaction.templatePropertyValue.create({
                data: {
                  templateId: newTemplate.id,
                  propertyId: newPropertyId,
                  value: templateValue.value as Prisma.InputJsonValue,
                },
              });
            }
          }
        }
      }

      for (const view of source.views) {
        await transaction.view.create({
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
        });
      }

      if (options.includeAutomations !== false) {
        for (const automation of source.automations) {
          await transaction.automation.create({
            data: {
              name: automation.name,
              trigger: automation.trigger,
              condition: automation.condition as Prisma.InputJsonValue,
              actions: automation.actions as Prisma.InputJsonValue,
              active: automation.active,
              config: automation.config as Prisma.InputJsonValue,
              databaseId: newDatabase.id,
            },
          });
        }
      }

      if (options.includeRecords === true) {
        for (const record of source.records) {
          const newRecord = await transaction.record.create({
            data: {
              databaseId: newDatabase.id,
              name: record.name,
              icon: record.icon,
            },
          });

          for (const value of record.values) {
            const newPropertyId = propertyIdMap.get(value.propertyId);

            if (!newPropertyId) continue;

            await transaction.propertyValue.create({
              data: {
                recordId: newRecord.id,
                propertyId: newPropertyId,
                value: value.value as Prisma.InputJsonValue,
                computed: value.computed,
              },
            });
          }
        }
      }

      return toDatabaseResponseDto(newDatabase);
    });
  }
}
