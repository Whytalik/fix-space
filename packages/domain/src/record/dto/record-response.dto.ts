import { Exclude, Expose, Type } from 'class-transformer';
import { PropertyValueResponseDto } from '../../property-value/dto/property-value-response.dto';
import { RecordContentResponseDto } from '../../record-content/dto/record-content-response.dto';

@Exclude()
export class RecordResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  icon?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  config?: unknown;

  @Expose()
  @Type(() => PropertyValueResponseDto)
  values?: PropertyValueResponseDto[];

  @Expose()
  @Type(() => RecordContentResponseDto)
  content?: RecordContentResponseDto;

  constructor(partial: Partial<RecordResponseDto>) {
    Object.assign(this, partial);
  }
}
