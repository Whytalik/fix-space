import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { DuplicateSpaceDto, SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { sectionsInclude } from "../constants/space.constants";
import { SpaceRepository } from "../repositories/space.repository";
import { toSpaceResponseDto } from "../utils/to-space-response.util";

@Injectable()
export class DuplicateSpaceUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(DuplicateSpaceUseCase.name);
  }

  async execute(id: string, ownerId: string, options: DuplicateSpaceDto = {}): Promise<SpaceResponseDto> {
    this.logger.debug("Duplicating space with options", { id, ownerId, options });

    const count = await this.spaceRepo.count(ownerId);
    if (count >= 5) {
      throw new BadRequestException(t("errors.SPACE_LIMIT_REACHED"));
    }

    const sourceSpace = await this.spaceRepo.findByIdForDuplicate(id);

    if (!sourceSpace) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id }));
    }

    const newName = options.newName ?? (await this.spaceRepo.findUniqueSpaceName(sourceSpace.name, ownerId));

    return this.spaceRepo.transaction(async (transaction) => {
      const newSpace = await transaction.space.create({
        data: {
          name: newName,
          icon: sourceSpace.icon,
          ownerId,
        },
      });

      const sectionIdMap = new Map<string, string>();

      if (options.includeSections !== false) {
        for (const section of sourceSpace.sections) {
          const newSection = await transaction.section.create({
            data: {
              name: section.name,
              position: section.position,
              icon: section.icon,
              color: section.color,
              spaceId: newSpace.id,
            },
          });
          sectionIdMap.set(section.id, newSection.id);
        }
      }

      if (options.includeDatabases !== false) {
        for (const database of sourceSpace.databases) {
          const propertyIdMap = new Map<string, string>();

          const newDatabase = await transaction.database.create({
            data: {
              name: database.name,
              title: database.title,
              icon: database.icon,
              spaceId: newSpace.id,
              sectionId: (() => {
                if (!database.sectionId || options.includeSections === false) return null;
                return sectionIdMap.get(database.sectionId) ?? null;
              })(),
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

      this.logger.log("Space duplicated", {
        sourceSpaceId: id,
        newSpaceId: newSpace.id,
        ownerId,
      });

      const result = await transaction.space.findUnique({
        where: {
          id: newSpace.id,
        },
        include: sectionsInclude,
      });

      if (!result) {
        throw new InternalServerErrorException(t("errors.INTERNAL_ERROR"));
      }
      return toSpaceResponseDto(result);
    });
  }
}
