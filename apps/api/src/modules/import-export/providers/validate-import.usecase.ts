import { Injectable, NotFoundException } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { ImportLimitWarningDto, ImportSkippedRowDto, ImportValidateResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { parseCsvBuffer, validateCsvFile } from "../utils/csv-parser.util";
import { convertCsvValue } from "../utils/csv-value-converter.util";
import { ImportExportRepository } from "../repositories/import-export.repository";

const EXCLUDED_TYPES = new Set<PropertyType>([PropertyType.RELATION, PropertyType.FORMULA]);

@Injectable()
export class ValidateImportUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly repo: ImportExportRepository,
    private readonly typeRegistry: PropertyTypeRegistry,
  ) {
    this.logger.setContext(ValidateImportUseCase.name);
  }

  async execute(
    file: Express.Multer.File,
    databaseId: string,
    mapping: Record<string, string>,
    userId: string,
  ): Promise<ImportValidateResponseDto> {
    this.logger.debug("Validating CSV import", { databaseId });

    validateCsvFile(file);

    const database = await this.repo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const properties = await this.repo.findPropertiesByDatabase(databaseId);
    const propertyMap = new Map(properties.map((p) => [p.id, p]));

    const { rows, totalRows } = parseCsvBuffer(file.buffer);

    const skippedRows: ImportSkippedRowDto[] = [];
    let validRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowErrors: string[] = [];

      for (const [csvColumn, propertyId] of Object.entries(mapping)) {
        if (propertyId === "__name__") continue;

        const property = propertyMap.get(propertyId);
        if (!property) continue;
        if (EXCLUDED_TYPES.has(property.type as PropertyType)) continue;

        const rawValue = row[csvColumn] ?? "";
        const converted = convertCsvValue(rawValue, property.type as PropertyType);

        if (!converted.valid) {
          rowErrors.push(`${property.name}: ${converted.reason}`);
          continue;
        }

        if (converted.value !== null) {
          const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);
          const errors = handler.validateValue(converted.value, config);
          if (errors?.length) {
            rowErrors.push(`${property.name}: ${errors.join(", ")}`);
          }
        }
      }

      if (rowErrors.length > 0) {
        skippedRows.push(new ImportSkippedRowDto({ rowIndex: i + 1, reason: rowErrors.join("; ") }));
      } else {
        validRows++;
      }
    }

    const limitWarning = await this.buildLimitWarning(databaseId, validRows);

    this.logger.log("CSV validation complete", { databaseId, totalRows, validRows, skipped: skippedRows.length });

    return new ImportValidateResponseDto({ totalRows, validRows, skippedRows, limitWarning });
  }

  private async buildLimitWarning(databaseId: string, validRows: number): Promise<ImportLimitWarningDto | null> {
    const limit = await this.repo.findDefaultViewLimit(databaseId);
    if (!limit) return null;

    const currentCount = await this.repo.countRecords(databaseId);
    const remaining = limit - currentCount;
    if (remaining >= validRows) return null;

    return new ImportLimitWarningDto({
      currentCount,
      limit,
      willImport: Math.max(0, remaining),
      fileRows: validRows,
    });
  }
}
