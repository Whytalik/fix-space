import { Exclude, Expose, Type } from "class-transformer";

import { ApiProperty } from "@nestjs/swagger";

import { PropertyValueResponseDto } from "../../property-value/dto/property-value-response.dto";

@Exclude()
export class RecordResponseDto {
  @ApiProperty({ description: "Record ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Template ID", example: "550e8400-e29b-41d4-a716-446655440000", nullable: true })
  @Expose()
  templateId: string | null;

  @ApiProperty({ description: "Source integration ID", example: "550e8400-e29b-41d4-a716-446655440000", nullable: true })
  @Expose()
  sourceIntegrationId: string | null;

  @ApiProperty({ description: "Source label", example: "API import", nullable: true })
  @Expose()
  sourceLabel: string | null;

  @ApiProperty({ description: "Source position ID", example: "550e8400-e29b-41d4-a716-446655440000", nullable: true })
  @Expose()
  sourcePositionId: string | null;

  @ApiProperty({ description: "Source currency code", example: "USD", nullable: true })
  @Expose()
  sourceCurrency: string | null;

  @ApiProperty({ description: "Record name", example: "My Record" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Record icon emoji", example: "📁", nullable: true })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Soft delete timestamp", nullable: true })
  @Expose()
  deletedAt: Date | null;

  @ApiProperty({ description: "Creation timestamp" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Record configuration data", required: false })
  @Expose()
  config?: unknown;

  @ApiProperty({ description: "Property values", type: [PropertyValueResponseDto], required: false })
  @Expose()
  @Type(() => PropertyValueResponseDto)
  values?: PropertyValueResponseDto[];

  constructor(partial: Partial<RecordResponseDto>) {
    Object.assign(this, partial);
  }
}
