import { Exclude, Expose, Type } from "class-transformer";
import { PropertyValueResponseDto } from "../../property-value/dto/property-value-response.dto";

@Exclude()
export class RecordResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  icon: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  config?: unknown;

  @Expose()
  @Type(() => PropertyValueResponseDto)
  values?: PropertyValueResponseDto[];

  constructor(partial: Partial<RecordResponseDto>) {
    Object.assign(this, partial);
  }
}
