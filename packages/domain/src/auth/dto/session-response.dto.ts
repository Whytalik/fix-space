import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SessionResponseDto {
  @ApiProperty({ description: "Session ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Session creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Session expiration timestamp", example: "2024-01-15T00:00:00.000Z" })
  @Expose()
  expiresAt: Date;

  @ApiProperty({ description: "Whether this is the current session", required: false })
  @Expose()
  isCurrent?: boolean;

  constructor(partial: Partial<SessionResponseDto>) {
    Object.assign(this, partial);
  }
}
