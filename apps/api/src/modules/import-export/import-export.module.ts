import { Module } from "@nestjs/common";
import { PropertyModule } from "@/modules/property/property.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { CsvPreviewUseCase } from "./providers/csv-preview.usecase";
import { ExecuteImportUseCase } from "./providers/execute-import.usecase";
import { ExportCsvUseCase } from "./providers/export-csv.usecase";
import { ValidateImportUseCase } from "./providers/validate-import.usecase";
import { ImportExportRepository } from "./repositories/import-export.repository";
import { ImportExportController } from "./import-export.controller";

@Module({
  imports: [PropertyModule, NotificationModule],
  controllers: [ImportExportController],
  providers: [CsvPreviewUseCase, ValidateImportUseCase, ExecuteImportUseCase, ExportCsvUseCase, ImportExportRepository],
})
export class ImportExportModule {}
