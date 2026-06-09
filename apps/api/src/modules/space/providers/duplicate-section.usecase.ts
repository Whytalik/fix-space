import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { DuplicateOptionsDto, SectionResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { SectionRepository } from "../repositories/section.repository";
import { generateUniqueName } from "@/common/utils/generate-unique-name";

@Injectable()
export class DuplicateSectionUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly sectionRepo: SectionRepository,
  ) {
    this.logger.setContext(DuplicateSectionUseCase.name);
  }

  async execute(sectionId: string, options: DuplicateOptionsDto & { newName?: string }): Promise<SectionResponseDto> {
    this.logger.debug("Duplicating section", { sectionId });

    const source = await this.sectionRepo.findByIdForDuplicate(sectionId);

    if (!source) {
      throw new NotFoundException(t("errors.SECTION_NOT_FOUND_ID", { id: sectionId }));
    }

    const newName = options.newName ?? generateUniqueName(source.name);

    const result = await this.sectionRepo.transaction(async (transaction) => {
      const lastPosition = await this.sectionRepo.findLastPosition(source.spaceId, transaction);
      const position = lastPosition !== null ? lastPosition.position + 1 : 0;

      const newSection = await transaction.section.create({
        data: {
          name: newName,
          icon: source.icon,
          color: source.color,
          position,
          spaceId: source.spaceId,
        },
      });

      if (options.includeDatabases !== false) {
        for (const database of source.databases) {
          const propertyIdMap = new Map<string, string>();

          const newDatabase = await transaction.database.create({
            data: {
              name: database.name,
              title: database.title,
              icon: database.icon,
              spaceId: source.spaceId,
              sectionId: newSection.id,
            },
          });

          if (options.includeProperties !== false) {
            for (const property of database.properties) {
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
            for (const template of database.templates) {
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

          if (options.includeAutomations !== false) {
            for (const automation of database.automations) {
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
        }
      }

      return new SectionResponseDto(newSection);
    });

    this.logger.log("Section duplicated", { sectionId, newSectionId: result.id });
    return result;
  }
}
