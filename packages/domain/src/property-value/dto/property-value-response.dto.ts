import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PropertyValueResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordId: string;

  @Expose()
  propertyId: string;

  @Expose()
  value?: unknown;

  @Expose()
  computed: boolean;

  constructor(partial: Partial<PropertyValueResponseDto>) {
    Object.assign(this, partial);
  }
}
