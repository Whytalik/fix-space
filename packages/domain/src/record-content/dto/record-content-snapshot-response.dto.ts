import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecordContentSnapshotResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "Record content ID", example: "clx123..." })
  @Expose()
  recordContentId: string;

  @ApiProperty({ description: "Snapshot content data", example: {} })
  @Expose()
  content: unknown;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<RecordContentSnapshotResponseDto>) {
    Object.assign(this, partial);
  }
}
