import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { DatabaseResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { t } from "../../../common/utils/i18n.helper";
import { DatabaseRepository } from "../repositories/database.repository";
import { generateUniqueName, generateUniqueSlug } from "../../../common/utils/generate-unique-name";
import { toDatabaseResponseDto } from "../utils/to-database-response.util";

@Injectable()
export class DuplicateDatabaseUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly databaseRepo: DatabaseRepository,
  ) {
    this.logger.setContext(DuplicateDatabaseUseCase.name);
  }

  async execute(databaseId: string): Promise<DatabaseResponseDto> {
    const source = await this.databaseRepo.findByIdForDuplicate(databaseId);

    if (!source) {
      throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));
    }

    const newName = generateUniqueName(source.title);

    return this.databaseRepo.transaction(async (transaction) => {
      const newDatabase = await transaction.database.create({
        data: {
          spaceId: source.spaceId,
          sectionId: source.sectionId,
          name: generateUniqueSlug(source.name),
          title: newName,
          icon: source.icon,
        },
      });

      const propertyIdMap = new Map<string, string>();

      for (const property of source.properties) {
        const newProperty = await transaction.property.create({
          data: {
            ...property,
            id: undefined,
            databaseId: newDatabase.id,
            config: property.config as Prisma.InputJsonValue,
          },
        });

        propertyIdMap.set(property.id, newProperty.id);
      }

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

      return toDatabaseResponseDto(newDatabase);
    });
  }
}
