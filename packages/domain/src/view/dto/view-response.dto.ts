import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { RecordFilterDto } from "../../record/dto/record-filter.dto";
import { RecordSortDto } from "../../record/dto/record-sort.dto";

@Exclude()
export class ViewResponseDto {
  @ApiProperty({ description: "ID", example: "uuid", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID", example: "uuid", required: true })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "View name", example: "Grid View", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Is default view", example: false, required: true })
  @Expose()
  isDefault: boolean;

  @ApiProperty({ description: "Is view locked", example: false, required: true })
  @Expose()
  isLocked: boolean;

  @ApiProperty({ description: "Page size", example: 50, required: true })
  @Expose()
  pageSize: number;

  @ApiProperty({ description: "Filters", required: true })
  @Expose()
  @Type(() => RecordFilterDto)
  filters: RecordFilterDto[];

  @ApiProperty({ description: "Sort configuration", required: true })
  @Expose()
  @Type(() => RecordSortDto)
  sort: RecordSortDto[];

  @ApiProperty({ description: "Group by property", example: "status", required: true, nullable: true })
  @Expose()
  groupBy: string | null;

  @ApiProperty({ description: "Hidden columns", example: [], required: true })
  @Expose()
  hiddenColumns: string[];

  @ApiProperty({ description: "Column widths", example: {}, required: true, nullable: true })
  @Expose()
  columnWidths: Record<string, number> | null;

  @ApiProperty({ description: "Text wrap enabled", example: true, required: true })
  @Expose()
  textWrap: boolean;

  @ApiProperty({ description: "Search query", example: null, required: true, nullable: true })
  @Expose()
  searchQuery: string | null;

  @ApiProperty({ description: "Created at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Updated at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ViewResponseDto>) {
    Object.assign(this, partial);
  }
}
