import { Injectable, NotFoundException } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { ImportErrorRowDto, ImportResultResponseDto } from "@fixspace/domain";
import { Prisma } from "@fixspace/database";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { parseCsvBuffer, validateCsvFile } from "../utils/csv-parser.util";
import { convertCsvValue } from "../utils/csv-value-converter.util";
import { ImportExportRepository } from "../repositories/import-export.repository";

const EXCLUDED_TYPES = new Set<PropertyType>([PropertyType.RELATION, PropertyType.FORMULA]);

export interface ExecuteImportOptions {
  /** When set, import only this many records (used when limit would be exceeded) */
  maxRows?: number;
}

@Injectable()
export class ExecuteImportUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly repo: ImportExportRepository,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(ExecuteImportUseCase.name);
  }

  async execute(
    file: Express.Multer.File,
    databaseId: string,
    mapping: Record<string, string>,
    userId: string,
    options: ExecuteImportOptions = {},
  ): Promise<ImportResultResponseDto> {
    this.logger.debug("Executing CSV import", { databaseId });

    validateCsvFile(file);

    const database = await this.repo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const properties = await this.repo.findPropertiesByDatabase(databaseId);
    const propertyMap = new Map(properties.map((p) => [p.id, p]));

    const { rows } = parseCsvBuffer(file.buffer);

    const validData: Array<{
      name: string;
      databaseId: string;
      values: Array<{ propertyId: string; value: Prisma.InputJsonValue }>;
    }> = [];
    const errors: ImportErrorRowDto[] = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      if (options.maxRows !== undefined && validData.length >= options.maxRows) break;

      const row = rows[i]!;
      const rowErrors: string[] = [];
      const valuesToCreate: Array<{ propertyId: string; value: Prisma.InputJsonValue }> = [];
      let recordName = "Untitled";

      for (const [csvColumn, propertyId] of Object.entries(mapping)) {
        const rawValue = row[csvColumn] ?? "";

        if (propertyId === "__name__") {
          if (rawValue.trim()) recordName = rawValue.trim();
          continue;
        }

        const property = propertyMap.get(propertyId);
        if (!property) continue;
        if (EXCLUDED_TYPES.has(property.type as PropertyType)) continue;

        const converted = convertCsvValue(rawValue, property.type as PropertyType);
        if (!converted.valid) {
          rowErrors.push(`${property.name}: ${converted.reason}`);
          continue;
        }

        if (converted.value !== null) {
          const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);
          const validationErrors = handler.validateValue(converted.value, config);
          if (validationErrors?.length) {
            rowErrors.push(`${property.name}: ${validationErrors.join(", ")}`);
            continue;
          }
          valuesToCreate.push({ propertyId, value: converted.value as Prisma.InputJsonValue });

          if (property.name.toLowerCase() === "name" && recordName === "Untitled" && typeof converted.value === "string") {
            recordName = converted.value;
          }
        }
      }

      if (rowErrors.length > 0) {
        errors.push(new ImportErrorRowDto({ rowIndex: i + 1, reason: rowErrors.join("; ") }));
        skipped++;
      } else {
        validData.push({ databaseId, name: recordName, values: valuesToCreate });
      }
    }

    if (validData.length > 0) {
      await this.repo.transaction(async (transaction) => {
        const CHUNK_SIZE = 100;
        for (let chunkStart = 0; chunkStart < validData.length; chunkStart += CHUNK_SIZE) {
          const chunk = validData.slice(chunkStart, chunkStart + CHUNK_SIZE);
          await this.repo.createRecordsBulk(chunk, transaction);
        }
      });
    }

    this.logger.log("CSV import executed", { databaseId, imported: validData.length, skipped });

    return new ImportResultResponseDto({ imported: validData.length, skipped, errors });
  }
}
