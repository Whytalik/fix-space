import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { t } from "../../../common/utils/i18n.helper";
import { sectionsInclude } from "../constants/space.constants";
import { SpaceRepository } from "../repositories/space.repository";
import { generateUniqueName } from "../../../common/utils/generate-unique-name";
import { toSpaceResponseDto } from "../utils/to-space-response.util";

export interface DuplicateSpaceOptions {
  newName?: string;
}

@Injectable()
export class DuplicateSpaceUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly spaceRepo: SpaceRepository,
  ) {
    this.logger.setContext(DuplicateSpaceUseCase.name);
  }

  async execute(id: string, ownerId: string, options?: DuplicateSpaceOptions): Promise<SpaceResponseDto> {
    this.logger.debug("Duplicating space", { id, ownerId });

    const sourceSpace = await this.spaceRepo.findByIdForDuplicate(id);

    if (!sourceSpace) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id }));
    }

    const newName = options?.newName ?? generateUniqueName(sourceSpace.name);

    return this.spaceRepo.transaction(async (transaction) => {
      const newSpace = await transaction.space.create({
        data: {
          name: newName,
          icon: sourceSpace.icon,
          ownerId,
        },
      });

      const sectionIdMap = new Map<string, string>();

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

      for (const database of sourceSpace.databases) {
        const propertyIdMap = new Map<string, string>();

        const newDatabase = await transaction.database.create({
          data: {
            name: database.name,
            title: database.title,
            icon: database.icon,
            spaceId: newSpace.id,
            sectionId: (() => {
              if (!database.sectionId) return null;
              const mapped = sectionIdMap.get(database.sectionId);
              if (mapped === undefined) {
                this.logger.warn("Section ID not found in sectionIdMap during duplication", {
                  databaseId: database.id,
                  originalSectionId: database.sectionId,
                });
                return null;
              }
              return mapped;
            })(),
          },
        });

        for (const property of database.properties) {
          const newProperty = await transaction.property.create({
            data: {
              name: property.name,
              type: property.type,
              position: property.position,
              icon: property.icon,
              isRequired: property.isRequired,
              isVisible: property.isVisible,
              databaseId: newDatabase.id,
              config: property.config as Prisma.InputJsonValue,
            },
          });
          propertyIdMap.set(property.id, newProperty.id);
        }

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

        for (const record of database.records) {
          const newRecord = await transaction.record.create({
            data: {
              name: record.name,
              icon: record.icon,
              databaseId: newDatabase.id,
            },
          });

          for (const value of record.values) {
            const newPropertyId = propertyIdMap.get(value.propertyId);
            if (newPropertyId) {
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
