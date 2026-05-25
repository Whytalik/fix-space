import { Exclude, Expose, Type } from "class-transformer";
import { DatabaseResponseDto } from "../../database/dto/database-response.dto";
import { SectionResponseDto } from "../../section/dto/section-response.dto";
import { SpaceConfigDto } from "./space-config.dto";

@Exclude()
export class SpaceResponseDto {
  @Expose()
  id: string;

  @Expose()
  ownerId: string;

  @Expose()
  name: string;

  @Expose()
  icon: string | null;

  @Expose()
  isDefault: boolean;

  @Expose()
  isDemo: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => SpaceConfigDto)
  config?: SpaceConfigDto;

  @Expose()
  @Type(() => SectionResponseDto)
  sections?: SectionResponseDto[];

  @Expose()
  @Type(() => DatabaseResponseDto)
  databases?: DatabaseResponseDto[];

  constructor(partial: Partial<SpaceResponseDto>) {
    Object.assign(this, partial);
  }
}
