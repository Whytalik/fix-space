import { Injectable, NotFoundException } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { ImportErrorRowDto, ImportResultResponseDto } from "@fixspace/domain";
import { Prisma, NotificationType, type Property } from "@fixspace/database";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { NotificationService } from "@/modules/notification/notification.service";
import { parseCsvBuffer, validateCsvFile } from "../utils/csv-parser.util";
import { convertCsvValue } from "../utils/csv-value-converter.util";
import { extractAllowedValues } from "../utils/csv-select-options.util";
import { ImportExportRepository } from "../repositories/import-export.repository";

const EXCLUDED_TYPES = new Set<PropertyType>([PropertyType.RELATION, PropertyType.FORMULA]);
const OPTION_TYPES = new Set<PropertyType>([PropertyType.SELECT, PropertyType.STATUS]);

const CLOSED_KEYWORDS = ["clos", "закрит", "завершен", "done", "finish", "complet"];

function findClosedOption(allowedValues: string[]): string | undefined {
  return allowedValues.find((v) => CLOSED_KEYWORDS.some((kw) => v.toLowerCase().includes(kw)));
}

export interface ExecuteImportOptions {
  maxRows?: number;
  addUnknownOptionPropertyIds?: string[];
  partialImport?: boolean;
  templateId?: string;
}

@Injectable()
export class ExecuteImportUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly repo: ImportExportRepository,
    private readonly typeRegistry: PropertyTypeRegistry,
    private readonly notificationService: NotificationService,
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
    let propertyMap = new Map(properties.map((property) => [property.id, property]));

    if (options.addUnknownOptionPropertyIds?.length) {
      propertyMap = await this.patchUnknownOptions(file, mapping, propertyMap, new Set(options.addUnknownOptionPropertyIds));
    }

    const { rows } = parseCsvBuffer(file.buffer);

    const { templateId } = options;

    const validData: Array<{
      name: string;
      databaseId: string;
      templateId?: string;
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

        const { handler, config } = this.typeRegistry.resolveHandlerAndConfig(property);
        const allowedValues = extractAllowedValues(property.type as PropertyType, config);
        const converted = convertCsvValue(rawValue, property.type as PropertyType, allowedValues);
        if (!converted.valid) {
          rowErrors.push(`${property.name}: ${t(`errors.${converted.error.code}`, converted.error.args)}`);
          continue;
        }

        if (converted.value !== null) {
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

      const coveredPropertyIds = new Set(valuesToCreate.map((v) => v.propertyId));
      for (const [, property] of propertyMap) {
        if (property.type !== (PropertyType.STATUS as string)) continue;
        if (coveredPropertyIds.has(property.id)) continue;
        const allowedValues = extractAllowedValues(PropertyType.STATUS, property.config as Record<string, unknown>);
        const closedValue = findClosedOption(allowedValues);
        if (closedValue) valuesToCreate.push({ propertyId: property.id, value: closedValue as Prisma.InputJsonValue });
      }

      const uniqueValues = Array.from(new Map(valuesToCreate.map((v) => [v.propertyId, v])).values());

      if (rowErrors.length > 0 && !options.partialImport) {
        errors.push(new ImportErrorRowDto({ rowIndex: i + 1, reason: rowErrors.join("\n") }));
        skipped++;
      } else {
        if (rowErrors.length > 0) {
          errors.push(new ImportErrorRowDto({ rowIndex: i + 1, reason: rowErrors.join("\n") }));
        }
        validData.push({ databaseId, name: recordName, templateId, values: uniqueValues });
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

    await this.notificationService.create(
      userId,
      NotificationType.INFO,
      t("notifications.import_completed", { imported: validData.length, skipped }),
    );

    return new ImportResultResponseDto({ imported: validData.length, skipped, errors });
  }

  private async patchUnknownOptions(
    file: Express.Multer.File,
    mapping: Record<string, string>,
    propertyMap: Map<string, Property>,
    allowedPropertyIds: Set<string>,
  ) {
    const { rows } = parseCsvBuffer(file.buffer);

    const unknownByProperty = new Map<string, Set<string>>();

    for (const row of rows) {
      for (const [csvColumn, propertyId] of Object.entries(mapping)) {
        if (propertyId === "__name__") continue;
        const property = propertyMap.get(propertyId);
        if (!property || !OPTION_TYPES.has(property.type as PropertyType)) continue;
        if (!allowedPropertyIds.has(propertyId)) continue;

        const rawValue = (row[csvColumn] ?? "").trim();
        if (!rawValue) continue;

        const allowedValues = extractAllowedValues(property.type as PropertyType, property.config as Record<string, unknown>);
        if (allowedValues.length > 0 && !allowedValues.includes(rawValue)) {
          if (!unknownByProperty.has(propertyId)) unknownByProperty.set(propertyId, new Set());
          unknownByProperty.get(propertyId)!.add(rawValue);
        }
      }
    }

    for (const [propertyId, newValues] of unknownByProperty) {
      const property = propertyMap.get(propertyId)!;
      const config = structuredClone(property.config) as Record<string, unknown>;
      const categories = config.categories as Array<Record<string, unknown>>;
      if (!categories?.length) continue;

      const targetCategory = categories[0]!;
      const options = targetCategory.options as Array<Record<string, unknown>>;

      for (const value of newValues) {
        if (property.type === PropertyType.SELECT) {
          options.push({ value });
        } else {
          options.push({ name: value, color: "#6B7280" });
        }
      }

      const updated = await this.repo.updatePropertyConfig(propertyId, config);
      propertyMap.set(propertyId, updated);
    }

    return propertyMap;
  }
}
