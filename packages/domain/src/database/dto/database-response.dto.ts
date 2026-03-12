import { Exclude, Expose } from "class-transformer";

@Exclude()
export class DatabaseResponseDto {
  @Expose()
  id: string;

  @Expose()
  spaceId: string;

  @Expose()
  name: string;

  @Expose()
  title: string;

  @Expose()
  icon: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  sectionId: string | null;

  @Expose()
  recordLimit: number | null;

  constructor(partial: Partial<DatabaseResponseDto>) {
    Object.assign(this, partial);
  }
}
