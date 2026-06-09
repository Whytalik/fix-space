import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class ImportErrorRowDto {
  @Expose()
  @ApiProperty({ example: 5 })
  rowIndex: number;

  @Expose()
  @ApiProperty({ example: '"foo" is not a valid number' })
  reason: string;

  constructor(partial: Partial<ImportErrorRowDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ImportResultResponseDto {
  @Expose()
  @ApiProperty({ example: 148, description: "Number of records successfully created" })
  imported: number;

  @Expose()
  @ApiProperty({ example: 2, description: "Number of rows skipped due to validation errors" })
  skipped: number;

  @Expose()
  @Type(() => ImportErrorRowDto)
  @ApiProperty({ type: [ImportErrorRowDto], description: "Details for each skipped row" })
  errors: ImportErrorRowDto[];

  constructor(partial: Partial<ImportResultResponseDto>) {
    Object.assign(this, partial);
  }
}
