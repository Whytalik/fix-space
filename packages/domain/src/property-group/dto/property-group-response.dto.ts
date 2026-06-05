import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PropertyGroupResponseDto {
  @ApiProperty({ description: "ID", example: "uuid", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID", example: "uuid", required: true })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Group name", example: "General", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Position", example: 0, required: true })
  @Expose()
  position: number;

  @ApiProperty({ description: "Visibility configuration", required: true, nullable: true })
  @Expose()
  visibility: Record<string, unknown> | null;

  @ApiProperty({ description: "Created at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Updated at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PropertyGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
