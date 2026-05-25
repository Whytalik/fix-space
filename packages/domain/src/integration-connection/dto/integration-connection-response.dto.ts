import { Exclude, Expose } from "class-transformer";
import { IntegrationService } from "./create-integration-connection.dto";
import { IntegrationStatus } from "./update-integration-connection.dto";

@Exclude()
export class IntegrationConnectionResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  service: IntegrationService;

  @Expose()
  name: string;

  @Expose()
  status: IntegrationStatus;

  @Expose()
  syncInterval: number;

  @Expose()
  marketType: string | null;

  @Expose()
  externalAccountId: string | null;

  @Expose()
  lastSyncAt: Date | null;

  @Expose()
  lastSyncError: string | null;

  @Expose()
  consecutiveFailures: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<IntegrationConnectionResponseDto>) {
    Object.assign(this, partial);
  }
}
