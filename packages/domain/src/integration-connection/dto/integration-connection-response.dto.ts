import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IntegrationService } from "./create-integration-connection.dto";
import { IntegrationStatus } from "./update-integration-connection.dto";

@Exclude()
export class IntegrationConnectionResponseDto {
  @ApiProperty({ description: "Unique connection identifier", example: "c7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "User who owns the connection", example: "u7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  userId: string;

  @ApiProperty({ description: "Integration service provider", example: "BINANCE", required: true })
  @Expose()
  service: IntegrationService;

  @ApiProperty({ description: "Connection display name", example: "My Binance Account", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Connection status", example: "ACTIVE", required: true })
  @Expose()
  status: IntegrationStatus;

  @ApiProperty({ description: "Synchronization interval in minutes", example: 60, required: true })
  @Expose()
  syncInterval: number;

  @ApiProperty({ description: "Market type (e.g. spot, futures)", example: "spot", required: true, nullable: true })
  @Expose()
  marketType: string | null;

  @ApiProperty({ description: "External platform account identifier", example: "123456", required: true, nullable: true })
  @Expose()
  externalAccountId: string | null;

  @ApiProperty({ description: "Last synchronization timestamp", required: true, nullable: true })
  @Expose()
  lastSyncAt: Date | null;

  @ApiProperty({ description: "Last synchronization error message", example: "Connection refused", required: true, nullable: true })
  @Expose()
  lastSyncError: string | null;

  @ApiProperty({ description: "Number of consecutive failed sync attempts", example: 0, required: true })
  @Expose()
  consecutiveFailures: number;

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Record last update timestamp", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<IntegrationConnectionResponseDto>) {
    Object.assign(this, partial);
  }
}
