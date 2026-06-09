import { Injectable, NotFoundException } from "@nestjs/common";
import { stringify } from "csv-stringify/sync";
import { FilterLogic, PropertyType, RecordFilterDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { matchesFilter } from "@/modules/record/utils/record-filter.util";
import { formatValueForCsv } from "../utils/csv-value-converter.util";
import { ImportExportRepository } from "../repositories/import-export.repository";

const EXCLUDED_EXPORT_TYPES = new Set<PropertyType>([PropertyType.RELATION, PropertyType.FORMULA]);

export interface ExportCsvOptions {
  propertyIds?: string[];
  includeMetaFields?: boolean;
  viewId?: string;
}

@Injectable()
export class ExportCsvUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly repo: ImportExportRepository,
  ) {
    this.logger.setContext(ExportCsvUseCase.name);
  }

  async execute(databaseId: string, userId: string, options: ExportCsvOptions = {}): Promise<{ csv: Buffer; filename: string }> {
    this.logger.debug("Exporting CSV", { databaseId });

    const database = await this.repo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const allProperties = await this.repo.findPropertiesByDatabase(databaseId);
    const exportableProperties = allProperties.filter((p) => {
      if (EXCLUDED_EXPORT_TYPES.has(p.type as PropertyType)) return false;
      if (options.propertyIds?.length) return options.propertyIds.includes(p.id);
      return true;
    });

    let records = await this.repo.findRecordsWithValues(databaseId);

    if (options.viewId) {
      const view = await this.repo.findViewById(options.viewId);
      if (view?.databaseId === databaseId) {
        const filters = (view.filters as RecordFilterDto[] | null) ?? [];
        const filterLogic = (view.filterLogic as FilterLogic | null) ?? FilterLogic.AND;
        if (filters.length > 0) {
          records = records.filter((record) => {
            if (filterLogic === FilterLogic.OR) {
              return filters.some((f) => matchesFilter(record, f));
            }
            return filters.every((f) => matchesFilter(record, f));
          });
        }
      }
    }

    const includeMetaFields = options.includeMetaFields !== false;

    const filteredProperties = includeMetaFields
      ? exportableProperties.filter((p) => p.name.toLowerCase() !== "name")
      : exportableProperties;

    const header: string[] = [];
    if (includeMetaFields) header.push("Name", "Created At", "Updated At");
    filteredProperties.forEach((property) => header.push(property.name));

    const rows = records.map((record) => {
      const valueMap = new Map(record.values.map((propertyValue) => [propertyValue.propertyId, propertyValue.value]));
      const row: any[] = [];

      if (includeMetaFields) {
        row.push(record.name);
        row.push(record.createdAt.toISOString());
        row.push(record.updatedAt.toISOString());
      }

      for (const property of filteredProperties) {
        const rawValue = valueMap.get(property.id);
        row.push(formatValueForCsv(rawValue, property.type as PropertyType));
      }

      return row;
    });

    const csvString = stringify([header, ...rows], {
      bom: true,
      cast: {
        boolean: (v) => (v ? "true" : "false"),
      },
    });

    const csv = Buffer.from(csvString, "utf-8");
    const safeName = database.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${safeName}_export_${new Date().toISOString().slice(0, 10)}.csv`;

    this.logger.log("CSV exported", { databaseId, records: records.length });

    return { csv, filename };
  }
}
