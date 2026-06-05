import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { DatabaseResponseDto } from "../../database/dto/database-response.dto";

@Exclude()
export class SectionResponseDto {
  @ApiProperty({ description: "ID", example: "uuid", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Space ID", example: "uuid", required: true })
  @Expose()
  spaceId: string;

  @ApiProperty({ description: "Section name", example: "My Section", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Section key", example: "my-section", required: true, nullable: true })
  @Expose()
  key: string | null;

  @ApiProperty({ description: "Position", example: 0, required: true })
  @Expose()
  position: number;

  @ApiProperty({ description: "Section icon", example: "icon-name", required: true, nullable: true })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Section color", example: "#ff0000", required: true, nullable: true })
  @Expose()
  color: string | null;

  @ApiProperty({ description: "Created at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Updated at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Databases in this section", required: false })
  @Expose()
  @Type(() => DatabaseResponseDto)
  databases?: DatabaseResponseDto[];

  constructor(partial: Partial<SectionResponseDto>) {
    Object.assign(this, partial);
  }
}
