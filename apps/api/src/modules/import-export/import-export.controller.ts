import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CsvPreviewResponseDto, ImportResultResponseDto, ImportValidateResponseDto } from "@fixspace/domain";
import { memoryStorage } from "multer";
import type { Response } from "express";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { CsvPreviewUseCase } from "./providers/csv-preview.usecase";
import { ValidateImportUseCase } from "./providers/validate-import.usecase";
import { ExecuteImportUseCase } from "./providers/execute-import.usecase";
import { ExportCsvUseCase } from "./providers/export-csv.usecase";

const CSV_UPLOAD_SCHEMA = {
  type: "object",
  required: ["file", "databaseId"],
  properties: {
    file: { type: "string", format: "binary", description: "CSV file (max 25 MB, UTF-8)" },
    databaseId: { type: "string", description: "Target database ID" },
    mapping: { type: "string", description: 'JSON: Record<csvColumn, propertyId | "__name__">' },
    maxRows: { type: "number", description: "Max rows to import (limit override)" },
  },
};

@ApiTags("Import / Export")
@ApiBearerAuth("access-token")
@Controller("import-export")
export class ImportExportController {
  constructor(
    private readonly csvPreviewUseCase: CsvPreviewUseCase,
    private readonly validateImportUseCase: ValidateImportUseCase,
    private readonly executeImportUseCase: ExecuteImportUseCase,
    private readonly exportCsvUseCase: ExportCsvUseCase,
  ) {}

  @Post("preview")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload CSV and return column names + first 5 rows preview" })
  @ApiBody({ schema: CSV_UPLOAD_SCHEMA })
  @ApiResponse({ status: 200, description: "Preview generated.", type: CsvPreviewResponseDto })
  @ApiResponse({ status: 400, description: "Invalid file." })
  @ApiResponse({ status: 404, description: "Database not found." })
  preview(@UploadedFile() file: Express.Multer.File, @Body("databaseId") databaseId: string, @CurrentUser("userId") userId: string) {
    if (!file) throw new BadRequestException("file is required");
    if (!databaseId) throw new BadRequestException("databaseId is required");
    return this.csvPreviewUseCase.execute(file, databaseId, userId);
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Validate CSV rows against property types and return import summary" })
  @ApiBody({ schema: CSV_UPLOAD_SCHEMA })
  @ApiResponse({ status: 200, description: "Validation summary.", type: ImportValidateResponseDto })
  @ApiResponse({ status: 400, description: "Invalid file or mapping." })
  @ApiResponse({ status: 404, description: "Database not found." })
  validate(
    @UploadedFile() file: Express.Multer.File,
    @Body("databaseId") databaseId: string,
    @Body("mapping") mappingRaw: string,
    @CurrentUser("userId") userId: string,
  ) {
    if (!file) throw new BadRequestException("file is required");
    if (!databaseId) throw new BadRequestException("databaseId is required");
    const mapping = this.parseMapping(mappingRaw);
    return this.validateImportUseCase.execute(file, databaseId, mapping, userId);
  }

  @Post("import")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Execute CSV import — creates records for valid rows" })
  @ApiBody({ schema: CSV_UPLOAD_SCHEMA })
  @ApiResponse({ status: 200, description: "Import result.", type: ImportResultResponseDto })
  @ApiResponse({ status: 400, description: "Invalid file or mapping." })
  @ApiResponse({ status: 404, description: "Database not found." })
  import(
    @UploadedFile() file: Express.Multer.File,
    @Body("databaseId") databaseId: string,
    @Body("mapping") mappingRaw: string,
    @Body("maxRows") maxRowsRaw: string | undefined,
    @CurrentUser("userId") userId: string,
  ) {
    if (!file) throw new BadRequestException("file is required");
    if (!databaseId) throw new BadRequestException("databaseId is required");
    const mapping = this.parseMapping(mappingRaw);
    const maxRows = maxRowsRaw !== undefined ? parseInt(maxRowsRaw, 10) : undefined;
    return this.executeImportUseCase.execute(file, databaseId, mapping, userId, { maxRows });
  }

  @Get("export")
  @ApiOperation({ summary: "Export database records as CSV file" })
  @ApiQuery({ name: "databaseId", type: String })
  @ApiQuery({ name: "propertyIds", type: String, required: false, description: "Comma-separated property IDs (all if omitted)" })
  @ApiQuery({ name: "includeMetaFields", type: Boolean, required: false, description: "Include name/createdAt/updatedAt (default: true)" })
  @ApiQuery({ name: "viewId", type: String, required: false, description: "View ID to apply active filters" })
  @ApiResponse({ status: 200, description: "CSV file." })
  @ApiResponse({ status: 404, description: "Database not found." })
  async export(
    @Query("databaseId") databaseId: string,
    @Query("propertyIds") propertyIdsRaw: string | undefined,
    @Query("includeMetaFields") includeMetaFieldsRaw: string | undefined,
    @Query("viewId") viewId: string | undefined,
    @CurrentUser("userId") userId: string,
    @Res() res: Response,
  ) {
    if (!databaseId) throw new BadRequestException("databaseId is required");

    const propertyIds = propertyIdsRaw ? propertyIdsRaw.split(",").filter(Boolean) : undefined;
    const includeMetaFields = includeMetaFieldsRaw !== "false";

    const { csv, filename } = await this.exportCsvUseCase.execute(databaseId, userId, { propertyIds, includeMetaFields, viewId });

    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": csv.length,
    });
    res.end(csv);
  }

  private parseMapping(raw: string | undefined): Record<string, string> {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      return parsed as Record<string, string>;
    } catch {
      throw new BadRequestException("mapping must be a valid JSON object");
    }
  }
}
