import { Exclude, Expose, Type } from "class-transformer";
import { PropertyValueResponseDto } from "../../property-value/dto/property-value-response.dto";

@Exclude()
export class SpaceSearchResultDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  databaseTitle: string;

  @Expose()
  name: string;

  @Expose()
  icon: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => PropertyValueResponseDto)
  values?: PropertyValueResponseDto[];

  constructor(partial: Partial<SpaceSearchResultDto>) {
    Object.assign(this, partial);
  }
}
