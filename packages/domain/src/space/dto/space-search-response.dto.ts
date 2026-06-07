import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { PropertyValueResponseDto } from "../../property-value/dto/property-value-response.dto";

@Exclude()
export class SpaceSearchResultDto {
  @ApiProperty({ description: "Record ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID" })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Database title", example: "My Journal" })
  @Expose()
  databaseTitle: string;

  @ApiProperty({ description: "Section name", required: false, example: "Daily" })
  @Expose()
  sectionName: string | null;

  @ApiProperty({ description: "Record name", example: "Record 1" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Record icon", required: false })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-10T00:00:00.000Z" })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Property values", required: false, type: () => PropertyValueResponseDto, isArray: true })
  @Expose()
  @Type(() => PropertyValueResponseDto)
  values?: PropertyValueResponseDto[];

  @ApiProperty({ description: "Record content JSON", required: false })
  @Expose()
  content?: any;

  constructor(partial: Partial<SpaceSearchResultDto>) {
    Object.assign(this, partial);
  }
}
