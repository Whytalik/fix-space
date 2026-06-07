import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { FilterLogic, RecordFilterDto } from "../../record/dto/record-filter.dto";
import { RecordSortDto } from "../../record/dto/record-sort.dto";
import { SummaryMetric } from "../../record/dto/record-summary.enums";

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

  @ApiProperty({ description: "Is view locked", example: false, required: true })
  @Expose()
  isLocked: boolean;

  @ApiProperty({ description: "Page size", example: 50, required: true })
  @Expose()
  pageSize: number;

  @ApiProperty({ description: "Maximum number of records", example: 50, required: false, nullable: true })
  @Expose()
  recordLimit: number | null;

  @ApiProperty({ description: "Whether to use default template", example: true, required: true })
  @Expose()
  useDefaultTemplate: boolean;

  @ApiProperty({ description: "Default template ID", example: "uuid", required: false, nullable: true })
  @Expose()
  defaultTemplateId: string | null;

  @ApiProperty({ description: "Filters", required: true })
  @Expose()
  @Type(() => RecordFilterDto)
  filters: RecordFilterDto[];

  @ApiProperty({ enum: FilterLogic, description: "Filter logic", required: true })
  @Expose()
  filterLogic: FilterLogic;

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

  @ApiProperty({ description: "Column summaries", example: {}, required: true })
  @Expose()
  columnSummaries: Record<string, SummaryMetric>;

  @ApiProperty({ description: "Group colors", example: {}, required: true })
  @Expose()
  groupColors: Record<string, string>;

  @ApiProperty({ description: "Hidden groups", example: [], required: true })
  @Expose()
  hiddenGroups: string[];

  @ApiProperty({ description: "Text wrap enabled", example: true, required: true })
  @Expose()
  textWrap: boolean;

  @ApiProperty({ description: "Use relative dates", example: true, required: true })
  @Expose()
  relativeDates: boolean;

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
