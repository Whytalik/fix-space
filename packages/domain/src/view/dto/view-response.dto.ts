import { Exclude, Expose, Type } from "class-transformer";
import { RecordFilterDto } from "../../record/dto/record-filter.dto";
import { RecordSortDto } from "../../record/dto/record-sort.dto";

@Exclude()
export class ViewResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  isDefault: boolean;

  @Expose()
  isLocked: boolean;

  @Expose()
  pageSize: number;

  @Expose()
  @Type(() => RecordFilterDto)
  filters: RecordFilterDto[];

  @Expose()
  @Type(() => RecordSortDto)
  sort: RecordSortDto[];

  @Expose()
  groupBy: string | null;

  @Expose()
  hiddenColumns: string[];

  @Expose()
  columnWidths: Record<string, number> | null;

  @Expose()
  textWrap: boolean;

  @Expose()
  searchQuery: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ViewResponseDto>) {
    Object.assign(this, partial);
  }
}
