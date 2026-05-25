import { Exclude, Expose } from "class-transformer";
import { ImportStatus } from "./create-import-mapping.dto";

@Exclude()
export class ImportHistoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  importMappingId: string;

  @Expose()
  status: ImportStatus;

  @Expose()
  recordsCreated: number;

  @Expose()
  recordsFailed: number;

  @Expose()
  errorLog: unknown;

  @Expose()
  sourceFileInfo: unknown;

  @Expose()
  createdAt: Date;

  @Expose()
  completedAt: Date | null;

  constructor(partial: Partial<ImportHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
