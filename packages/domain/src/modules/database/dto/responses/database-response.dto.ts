import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class DatabaseResponseDto {
  @ApiProperty({ description: "Database ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Space ID" })
  @Expose()
  spaceId: string;

  @ApiProperty({ description: "Database slug name", example: "trading-journal" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Database type", example: "trading-journal" })
  @Expose()
  type: string | null;

  @ApiProperty({ description: "Unique key for system databases", example: "trading-journal" })
  @Expose()
  key: string | null;

  @ApiProperty({ description: "Database icon", example: "database" })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-10T00:00:00.000Z" })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Position for ordering", example: 0 })
  @Expose()
  position: number;

  @ApiProperty({ description: "Section ID" })
  @Expose()
  sectionId: string | null;

  @ApiProperty({ description: "Whether this is a key database", example: false })
  @Expose()
  isKey: boolean;

  @ApiProperty({ description: "Whether the database is locked", example: false })
  @Expose()
  isLocked: boolean;

  constructor(partial: Partial<DatabaseResponseDto>) {
    Object.assign(this, partial);
  }
}
