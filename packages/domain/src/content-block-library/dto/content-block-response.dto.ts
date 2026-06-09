import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class ContentBlockResponseDto {
  @ApiProperty({ description: "Unique content block identifier", example: "b7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "User who owns the block", example: "u7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  userId: string;

  @ApiProperty({ description: "Content block name", example: "Welcome Banner", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Content block data", required: true })
  @Expose()
  content: unknown;

  @ApiProperty({ description: "Whether the block is system-defined", example: false, required: true })
  @Expose()
  isSystem: boolean;

  @ApiProperty({ description: "Whether the block is visible", example: true, required: true })
  @Expose()
  isVisible: boolean;

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Record last update timestamp", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ContentBlockResponseDto>) {
    Object.assign(this, partial);
  }
}
