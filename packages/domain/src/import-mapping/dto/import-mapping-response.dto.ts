import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class ImportMappingResponseDto {
  @ApiProperty({ description: "Unique mapping identifier", example: "m7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Target database identifier", example: "db_a1b2c3d4", required: true })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Mapping name", example: "Binance Trades Import", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Source data type", example: "CSV", required: true })
  @Expose()
  sourceType: string;

  @ApiProperty({ description: "Field mapping rules (source → target)", example: { col_name: "field_name" }, required: true })
  @Expose()
  mappingRules: Record<string, string>;

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Record last update timestamp", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ImportMappingResponseDto>) {
    Object.assign(this, partial);
  }
}
