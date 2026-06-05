import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecordContentResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "Record ID", example: "clx123..." })
  @Expose()
  recordId: string;

  @ApiProperty({ description: "Record content data", example: {} })
  @Expose()
  content: Record<string, unknown>;

  @ApiProperty({ description: "Last edit timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  lastEditedAt: Date;

  constructor(partial: Partial<RecordContentResponseDto>) {
    Object.assign(this, partial);
  }
}
