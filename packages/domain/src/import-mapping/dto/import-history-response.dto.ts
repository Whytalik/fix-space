import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ImportStatus } from "./create-import-mapping.dto";

@Exclude()
export class ImportHistoryResponseDto {
  @ApiProperty({ description: "Unique import history identifier", example: "h7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Related import mapping identifier", example: "m7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  importMappingId: string;

  @ApiProperty({ description: "Import status", example: "COMPLETED", required: true })
  @Expose()
  status: ImportStatus;

  @ApiProperty({ description: "Number of records successfully created", example: 150, required: true })
  @Expose()
  recordsCreated: number;

  @ApiProperty({ description: "Number of records that failed to import", example: 3, required: true })
  @Expose()
  recordsFailed: number;

  @ApiProperty({ description: "Error log details", required: true })
  @Expose()
  errorLog: unknown;

  @ApiProperty({ description: "Source file metadata", required: true })
  @Expose()
  sourceFileInfo: unknown;

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Import completion timestamp", required: true, nullable: true })
  @Expose()
  completedAt: Date | null;

  constructor(partial: Partial<ImportHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
