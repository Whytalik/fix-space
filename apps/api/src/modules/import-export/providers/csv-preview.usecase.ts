import { Injectable, NotFoundException } from "@nestjs/common";
import { CsvPreviewResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { parseCsvBuffer, validateCsvFile } from "../utils/csv-parser.util";
import { ImportExportRepository } from "../repositories/import-export.repository";

@Injectable()
export class CsvPreviewUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly repo: ImportExportRepository,
  ) {
    this.logger.setContext(CsvPreviewUseCase.name);
  }

  async execute(file: Express.Multer.File, databaseId: string, userId: string): Promise<CsvPreviewResponseDto> {
    this.logger.debug("CSV preview", { databaseId, filename: file.originalname });

    validateCsvFile(file);

    const database = await this.repo.findDatabaseByOwner(databaseId, userId);
    if (!database) throw new NotFoundException(t("errors.DATABASE_NOT_FOUND"));

    const { columns, rows, totalRows } = parseCsvBuffer(file.buffer, true);

    this.logger.log("CSV preview generated", { databaseId, columns: columns.length, totalRows });

    return new CsvPreviewResponseDto({ columns, previewRows: rows, totalRows });
  }
}
