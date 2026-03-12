import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { DatabaseResponseDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";

@Injectable()
export class DuplicateDatabaseUseCase {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(DuplicateDatabaseUseCase.name);
  }

  async execute(databaseId: string): Promise<DatabaseResponseDto> {
    const source = await prisma.database.findUnique({
      where: { id: databaseId },
      include: {
        properties: true,
        records: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException("Database not found");
    }

    const newName = `${source.title} Copy`;

    return prisma.$transaction(async (tx) => {
      const newDb = await tx.database.create({
        data: {
          spaceId: source.spaceId,
          sectionId: source.sectionId,
          name: `${source.name}_copy`,
          title: newName,
          icon: source.icon,
        },
      });

      const propertyIdMap = new Map<string, string>();

      // Properties
      for (const prop of source.properties) {
        const newProp = await tx.property.create({
          data: {
            ...prop,
            id: undefined,
            databaseId: newDb.id,
            config: prop.config as Prisma.InputJsonValue,
          },
        });

        propertyIdMap.set(prop.id, newProp.id);
      }

      // Records
      for (const record of source.records) {
        const newRecord = await tx.record.create({
          data: {
            databaseId: newDb.id,
            name: record.name,
            icon: record.icon,
          },
        });

        for (const value of record.values) {
          const newPropertyId = propertyIdMap.get(value.propertyId);

          if (!newPropertyId) continue;

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

      return new DatabaseResponseDto(newDb);
    });
  }
}
