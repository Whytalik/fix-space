import { Exclude, Expose, Type } from "class-transformer";
import { DatabaseConfigDto } from "./database-config.dto";

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
  type: string | null;

  @Expose()
  key: string | null;

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

  @Expose()
  isPreset: boolean;

  @Expose()
  isLocked: boolean;

  @Expose()
  useDefaultTemplate: boolean;

  @Expose()
  enableStats: boolean;

  @Expose()
  @Type(() => DatabaseConfigDto)
  config?: DatabaseConfigDto;

  constructor(partial: Partial<DatabaseResponseDto>) {
    Object.assign(this, partial);
  }
}
