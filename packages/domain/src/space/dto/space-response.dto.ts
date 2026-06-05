import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { DatabaseResponseDto } from "../../database/dto/database-response.dto";
import { SectionResponseDto } from "../../section/dto/section-response.dto";
import { SpaceConfigDto } from "./space-config.dto";

@Exclude()
export class SpaceResponseDto {
  @ApiProperty({ description: "Space ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Owner user ID" })
  @Expose()
  ownerId: string;

  @ApiProperty({ description: "Space name", example: "My Journal" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Space icon", required: false })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Whether this is the default space", example: false })
  @Expose()
  isDefault: boolean;

  @ApiProperty({ description: "Whether this is a demo space", example: false })
  @Expose()
  isDemo: boolean;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Space configuration", required: false, type: () => SpaceConfigDto })
  @Expose()
  @Type(() => SpaceConfigDto)
  config?: SpaceConfigDto;

  @ApiProperty({ description: "Space sections", required: false, type: () => SectionResponseDto, isArray: true })
  @Expose()
  @Type(() => SectionResponseDto)
  sections?: SectionResponseDto[];

  @ApiProperty({ description: "Databases in this space", required: false, type: () => DatabaseResponseDto, isArray: true })
  @Expose()
  @Type(() => DatabaseResponseDto)
  databases?: DatabaseResponseDto[];

  constructor(partial: Partial<SpaceResponseDto>) {
    Object.assign(this, partial);
  }
}
