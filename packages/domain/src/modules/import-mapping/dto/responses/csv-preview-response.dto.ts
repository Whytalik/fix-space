import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class CsvPreviewResponseDto {
  @Expose()
  @ApiProperty({ type: [String], description: "CSV column names from header row" })
  columns: string[];

  @Expose()
  @ApiProperty({ type: [Object], description: "First 5 data rows keyed by column name" })
  previewRows: Record<string, string>[];

  @Expose()
  @ApiProperty({ example: 150, description: "Total data rows in file (excluding header)" })
  totalRows: number;

  constructor(partial: Partial<CsvPreviewResponseDto>) {
    Object.assign(this, partial);
  }
}
