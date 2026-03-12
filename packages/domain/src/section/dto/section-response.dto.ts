import { Exclude, Expose, Type } from "class-transformer";
import { DatabaseResponseDto } from "../../database/dto/database-response.dto";

@Exclude()
export class SectionResponseDto {
  @Expose()
  id: string;

  @Expose()
  spaceId: string;

  @Expose()
  name: string;

  @Expose()
  position: number;

  @Expose()
  icon: string | null;

  @Expose()
  color: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => DatabaseResponseDto)
  databases?: DatabaseResponseDto[];

  constructor(partial: Partial<SectionResponseDto>) {
    Object.assign(this, partial);
  }
}
