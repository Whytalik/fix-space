import { Injectable, NotFoundException } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { ImportLimitWarningDto, ImportSkippedRowDto, ImportUnknownOptionDto, ImportValidateResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { parseCsvBuffer, validateCsvFile } from "../utils/csv-parser.util";
import { convertCsvValue } from "../utils/csv-value-converter.util";
import { extractAllowedValues } from "../utils/csv-select-options.util";
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

    const SELECT_STATUS = new Set<PropertyType>([PropertyType.SELECT, PropertyType.STATUS]);
    const unknownOptionMap = new Map<string, { propertyName: string; propertyType: string; values: Set<string> }>();
    const skippedRows: ImportSkippedRowDto[] = [];
    let validRows = 0;
    let unknownOptionRowCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowErrors: string[] = [];
      let rowHasOnlyUnknownOptions = true;
      let rowHasUnknownOption = false;

      for (const [csvColumn, propertyId] of Object.entries(mapping)) {
        if (propertyId === "__name__") continue;

        const property = propertyMap.get(propertyId);
        if (!property) continue;
        if (EXCLUDED_TYPES.has(property.type as PropertyType)) continue;

        const rawValue = row[csvColumn] ?? "";
        const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);
        const allowedValues = extractAllowedValues(property.type as PropertyType, config);
        const converted = convertCsvValue(rawValue, property.type as PropertyType, allowedValues);

        if (!converted.valid) {
          rowErrors.push(`${property.name}: ${t(`errors.${converted.error.code}`, converted.error.args)}`);
          rowHasOnlyUnknownOptions = false;
          continue;
        }

        if (converted.value !== null && SELECT_STATUS.has(property.type as PropertyType)) {
          const label = typeof converted.value === "string" ? converted.value : null;
          if (label && allowedValues.length > 0 && !allowedValues.includes(label)) {
            if (!unknownOptionMap.has(propertyId)) {
              unknownOptionMap.set(propertyId, { propertyName: property.name, propertyType: property.type, values: new Set() });
            }
            unknownOptionMap.get(propertyId)!.values.add(label);
            rowHasUnknownOption = true;
            continue;
          }
        }

        if (converted.value !== null) {
          const errors = handler.validateValue(converted.value, config);
          if (errors?.length) {
            rowErrors.push(`${property.name}: ${errors.join(", ")}`);
            rowHasOnlyUnknownOptions = false;
          }
        }
      }

      if (rowErrors.length > 0) {
        skippedRows.push(new ImportSkippedRowDto({ rowIndex: i + 1, reason: rowErrors.join("\n") }));
      } else if (rowHasUnknownOption && rowHasOnlyUnknownOptions) {
        unknownOptionRowCount++;
      } else {
        validRows++;
      }
    }

    const unknownOptions = Array.from(unknownOptionMap.entries()).map(
      ([propertyId, { propertyName, propertyType, values }]) =>
        new ImportUnknownOptionDto({ propertyId, propertyName, propertyType, values: Array.from(values) }),
    );

    const limitWarning = await this.buildLimitWarning(databaseId, validRows + unknownOptionRowCount);

    this.logger.log("CSV validation complete", {
      databaseId,
      totalRows,
      validRows,
      skipped: skippedRows.length,
      unknownOptionRowCount,
    });

    return new ImportValidateResponseDto({ totalRows, validRows, skippedRows, limitWarning, unknownOptions, unknownOptionRowCount });
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
