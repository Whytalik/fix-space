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
    const allRecords = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true, // Allow rows with fewer/more columns (we'll handle mapping)
    }) as Record<string, string>[];

    if (allRecords.length === 0) {
      // Check for headers only
      const headersOnly = parse(buffer, {
        to: 1,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }) as string[][];

      const firstRow = headersOnly[0];
      if (!firstRow || firstRow.filter(Boolean).length === 0) {
        throw new BadRequestException(t("errors.CSV_EMPTY_FILE"));
      }

      return {
        columns: firstRow.filter(Boolean),
        rows: [],
        totalRows: 0,
      };
    }

    const firstRecord = allRecords[0];
    if (!firstRecord) {
      throw new BadRequestException(t("errors.CSV_EMPTY_FILE"));
    }

    const columns = Object.keys(firstRecord).filter(Boolean);
    const rows = previewOnly ? allRecords.slice(0, PREVIEW_ROWS) : allRecords;

    return {
      columns,
      rows,
      totalRows: allRecords.length,
    };
  } catch (error: any) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(`${t("errors.CSV_INVALID_FORMAT")}: ${error.message}`);
  }
}
