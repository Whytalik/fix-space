import { Exclude, Expose, Type } from 'class-transformer';
import { DatabaseResponseDto } from '../../database/dto/database-response.dto';
import { SectionResponseDto } from '../../section/dto/section-response.dto';

@Exclude()
export class SpaceResponseDto {
  @Expose()
  id: string;

  @Expose()
  ownerId: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  config?: Record<string, unknown>;

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
