import { Exclude, Expose, Type } from "class-transformer";
import { PropertyValueResponseDto } from "../../property-value/dto/property-value-response.dto";

@Exclude()
export class RecordResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  templateId: string | null;

  @Expose()
  sourceIntegrationId: string | null;

  @Expose()
  sourceLabel: string | null;

  @Expose()
  sourcePositionId: string | null;

  @Expose()
  sourceCurrency: string | null;

  @Expose()
  name: string;

  @Expose()
  icon: string | null;

  @Expose()
  deletedAt: Date | null;

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
