import { BadRequestException } from "@nestjs/common";
import { parse } from "csv-parse/sync";
import { t } from "@/common/utils/i18n.helper";

export interface ParsedCsvResult {
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const PREVIEW_ROWS = 5;

export function validateCsvFile(file: Express.Multer.File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new BadRequestException(t("errors.FILE_TOO_LARGE", { maxSize: "25" }));
  }
  const isTextCsv = file.mimetype === "text/csv" || file.mimetype === "application/csv" || file.mimetype === "text/plain";
  const hasCsvExt = file.originalname.toLowerCase().endsWith(".csv");
  if (!isTextCsv && !hasCsvExt) {
    throw new BadRequestException(t("errors.CSV_INVALID_FORMAT"));
  }
}

export function parseCsvBuffer(buffer: Buffer, previewOnly = false): ParsedCsvResult {
  try {
    const rawRecords = parse(buffer, {
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    }) as string[][];

    if (rawRecords.length === 0) {
      throw new BadRequestException(t("errors.CSV_EMPTY_FILE"));
    }

    let headerIndex = 0;
    let maxCols = 0;
    const searchLimit = Math.min(rawRecords.length, 50);

    for (let i = 0; i < searchLimit; i++) {
      const row = rawRecords[i];
      if (!row) continue;

      const colsCount = row.filter(Boolean).length;
      if (colsCount > maxCols) {
        maxCols = colsCount;
        headerIndex = i;
      }
    }

    const headerRow = rawRecords[headerIndex];
    if (!headerRow || maxCols === 0) {
      throw new BadRequestException(t("errors.CSV_EMPTY_FILE"));
    }

    const columnsArray = headerRow;
    const dataRecords = rawRecords.slice(headerIndex + 1).filter((row) => row.some((cell) => cell.trim() !== ""));

    const mappedRecords = dataRecords.map((row) => {
      const rowData: Record<string, string> = {};
      for (let i = 0; i < columnsArray.length; i++) {
        const colName = columnsArray[i];
        if (colName) {
          rowData[colName] = row[i] ?? "";
        }
      }
      return rowData;
    });

    const columns = Array.from(new Set(columnsArray.filter(Boolean)));
    const rows = previewOnly ? mappedRecords.slice(0, PREVIEW_ROWS) : mappedRecords;

    return {
      columns,
      rows,
      totalRows: mappedRecords.length,
    };
  } catch (error: any) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(`${t("errors.CSV_INVALID_FORMAT")}: ${error.message}`);
  }
}
