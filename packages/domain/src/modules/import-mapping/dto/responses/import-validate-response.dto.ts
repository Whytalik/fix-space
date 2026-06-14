import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

@Exclude()
export class ImportUnknownOptionDto {
  @Expose()
  @ApiProperty({ example: "prop-id-123" })
  @IsString()
  propertyId: string;

  @Expose()
  @ApiProperty({ example: "Entry Model" })
  @IsString()
  propertyName: string;

  @Expose()
  @ApiProperty({ example: "SELECT" })
  @IsString()
  propertyType: string;

  @Expose()
  @ApiProperty({ example: ["NewStrategy", "CustomModel"] })
  @IsArray()
  values: string[];

  constructor(partial: Partial<ImportUnknownOptionDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ImportSkippedRowDto {
  @Expose()
  @ApiProperty({ example: 3 })
  rowIndex: number;

  @Expose()
  @ApiProperty({ example: '"foo" is not a valid number' })
  reason: string;

  constructor(partial: Partial<ImportSkippedRowDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ImportLimitWarningDto {
  @Expose()
  @ApiProperty({ example: 80, description: "Current record count in the database" })
  currentCount: number;

  @Expose()
  @ApiProperty({ example: 100, description: "View record limit" })
  limit: number;

  @Expose()
  @ApiProperty({ example: 20, description: "Records that will be imported (min of validRows and remaining slots)" })
  willImport: number;

  @Expose()
  @ApiProperty({ example: 150, description: "Total valid rows in the file" })
  fileRows: number;

  constructor(partial: Partial<ImportLimitWarningDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ImportValidateResponseDto {
  @Expose()
  @ApiProperty({ example: 150 })
  totalRows: number;

  @Expose()
  @ApiProperty({ example: 148 })
  validRows: number;

  @Expose()
  @Type(() => ImportSkippedRowDto)
  @ApiProperty({ type: [ImportSkippedRowDto] })
  skippedRows: ImportSkippedRowDto[];

  @Expose()
  @Type(() => ImportLimitWarningDto)
  @ApiProperty({ type: ImportLimitWarningDto, required: false, nullable: true })
  limitWarning?: ImportLimitWarningDto | null;

  @Expose()
  @Type(() => ImportUnknownOptionDto)
  @ApiProperty({ type: [ImportUnknownOptionDto], required: false })
  unknownOptions?: ImportUnknownOptionDto[];

  @Expose()
  @ApiProperty({ example: 5, required: false })
  unknownOptionRowCount?: number;

  constructor(partial: Partial<ImportValidateResponseDto>) {
    Object.assign(this, partial);
  }
}
