import { Exclude, Expose } from "class-transformer";
import { PropertyType } from "./create-property.dto";

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
  icon: string | null;

  @Expose()
  hint: string | null;

  @Expose()
  group: string | null;

  @Expose()
  isRequired: boolean;

  @Expose()
  isVisible: boolean;

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
