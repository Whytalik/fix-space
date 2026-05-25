import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PropertyGroupResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  position: number;

  @Expose()
  visibility: Record<string, unknown> | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PropertyGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
