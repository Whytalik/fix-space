import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { SpaceResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { sectionsInclude } from "../space.constants";
import { SpaceRepository } from "../space.repository";

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
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    if (sourceSpace.ownerId !== ownerId) {
      throw new ForbiddenException(`Space with id ${id} does not belong to the requesting user`);
    }

    const newName = options?.newName ?? this.generateUniqueName(sourceSpace.name);

    return this.spaceRepo.transaction(async (tx) => {
      const newSpace = await tx.space.create({
        data: {
          name: newName,
          icon: sourceSpace.icon,
          ownerId,
        },
      });

      const sectionIdMap = new Map<string, string>();

      for (const section of sourceSpace.sections) {
        const newSection = await tx.section.create({
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

        const newDatabase = await tx.database.create({
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
          const newProperty = await tx.property.create({
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

        for (const record of database.records) {
          const newRecord = await tx.record.create({
            data: {
              name: record.name,
              icon: record.icon,
              databaseId: newDatabase.id,
            },
          });

          for (const value of record.values) {
            const newPropertyId = propertyIdMap.get(value.propertyId);
            if (newPropertyId) {
              await tx.propertyValue.create({
                data: {
                  recordId: newRecord.id,
                  propertyId: newPropertyId,
                  value: value.value as Prisma.InputJsonValue,
                  computed: value.computed,
                },
              });
            }
          }

          if (record.content) {
            await tx.recordContent.create({
              data: {
                recordId: newRecord.id,
              },
            });
          }
        }
      }

      this.logger.log("Space duplicated", {
        sourceSpaceId: id,
        newSpaceId: newSpace.id,
        ownerId,
      });

      const result = await tx.space.findUnique({
        where: {
          id: newSpace.id,
        },
        include: sectionsInclude,
      });

      if (!result) {
        throw new InternalServerErrorException(`Failed to fetch duplicated space ${newSpace.id}`);
      }
      return new SpaceResponseDto(result as unknown as Partial<SpaceResponseDto>);
    });
  }

  private generateUniqueName(baseName: string): string {
    return `${baseName} (Copy)`;
  }
}
