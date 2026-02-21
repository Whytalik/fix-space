import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@nucleus/database';
import { DEFAULT_SPACE_SETTINGS, SpaceResponseDto } from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';
import { SettingsService } from '../../settings/settings.service';

export interface DuplicateSpaceOptions {
  newName?: string;
}

const sectionsInclude = {
  sections: {
    orderBy: {
      position: 'asc' as const,
    },
  },
};

@Injectable()
export class DuplicateSpaceUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly settingsService: SettingsService,
  ) {
    this.logger.setContext(DuplicateSpaceUseCase.name);
  }

  async execute(
    id: string,
    ownerId: string,
    options?: DuplicateSpaceOptions,
  ): Promise<SpaceResponseDto> {
    this.logger.debug('Duplicating space', { id, ownerId });

    const sourceSpace = await prisma.space.findUnique({
      where: { id },
      include: {
        sections: true,
        databases: {
          include: {
            properties: true,
            records: {
              include: {
                values: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!sourceSpace) {
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    const newName =
      options?.newName ??
      (await this.generateUniqueName(ownerId, sourceSpace.name));

    const spaceSettings = await this.settingsService.getSettings(
      ownerId,
      'space',
      DEFAULT_SPACE_SETTINGS,
    );

    return prisma.$transaction(async (tx) => {
      // Create new space
      const newSpace = await tx.space.create({
        data: {
          name: newName,
          icon: sourceSpace.icon,
          ownerId,
          config:
            sourceSpace.config ??
            (spaceSettings as unknown as Prisma.JsonValue),
        },
      });

      // Map old section IDs to new section IDs
      const sectionIdMap = new Map<string, string>();

      // Duplicate sections
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

      // Duplicate databases with their properties, records, and values
      for (const database of sourceSpace.databases) {
        // Map old property IDs to new property IDs
        const propertyIdMap = new Map<string, string>();

        const newDatabase = await tx.database.create({
          data: {
            name: database.name,
            title: database.title,
            icon: database.icon,
            spaceId: newSpace.id,
            sectionId: database.sectionId
              ? sectionIdMap.get(database.sectionId)
              : null,
            config: database.config,
          },
        });

        // Duplicate properties
        for (const property of database.properties) {
          const newProperty = await tx.property.create({
            data: {
              name: property.name,
              type: property.type,
              position: property.position,
              icon: property.icon,
              color: property.color,
              isRequired: property.isRequired,
              isPrimary: property.isPrimary,
              databaseId: newDatabase.id,
              config: property.config,
            },
          });
          propertyIdMap.set(property.id, newProperty.id);
        }

        // Duplicate records with their values and content
        for (const record of database.records) {
          const newRecord = await tx.record.create({
            data: {
              name: record.name,
              icon: record.icon,
              databaseId: newDatabase.id,
              config: record.config,
            },
          });

          // Duplicate property values
          for (const value of record.values) {
            const newPropertyId = propertyIdMap.get(value.propertyId);
            if (newPropertyId) {
              await tx.propertyValue.create({
                data: {
                  recordId: newRecord.id,
                  propertyId: newPropertyId,
                  value: value.value,
                  computed: value.computed,
                },
              });
            }
          }

          // Duplicate record content if exists
          if (record.content) {
            await tx.recordContent.create({
              data: {
                recordId: newRecord.id,
                config: record.content.config,
              },
            });
          }
        }
      }

      this.logger.log('Space duplicated', {
        sourceSpaceId: id,
        newSpaceId: newSpace.id,
        ownerId,
      });

      // Fetch the complete new space with sections
      const result = await tx.space.findUnique({
        where: { id: newSpace.id },
        include: sectionsInclude,
      });

      return new SpaceResponseDto(result!);
    });
  }

  private async generateUniqueName(
    ownerId: string,
    baseName: string,
  ): Promise<string> {
    const existingSpaces = await prisma.space.findMany({
      where: { ownerId },
      select: { name: true },
    });

    const existingNames = new Set(existingSpaces.map((s) => s.name));
    let newName = `${baseName} (Copy)`;
    let counter = 2;

    while (existingNames.has(newName)) {
      newName = `${baseName} (Copy ${counter})`;
      counter++;
    }

    return newName;
  }
}
