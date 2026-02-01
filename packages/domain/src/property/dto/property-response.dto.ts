import { Exclude, Expose } from 'class-transformer';
import { PropertyType } from './create-property.dto';

@Exclude()
export class PropertyResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  type: PropertyType;

  @Expose()
  position: number;

  @Expose()
  isRequired: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
}
