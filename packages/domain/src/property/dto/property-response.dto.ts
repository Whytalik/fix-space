import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PropertyResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  type: string;

  @Expose()
  position: number;

  @Expose()
  icon?: string;

  @Expose()
  color?: string;

  @Expose()
  isRequired: boolean;

  @Expose()
  isPrimary: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  config?: unknown;

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
}
