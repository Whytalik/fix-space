import type { User } from "../../user/entities/user.entity";
import type { IntegrationService } from "../dto/create-integration-connection.dto";
import type { IntegrationStatus } from "../dto/update-integration-connection.dto";

export class IntegrationConnection {
  id: string;
  userId: string;
  spaceId?: string | null;
  service: IntegrationService;
  name: string;
  credentials: Record<string, unknown>;
  status: IntegrationStatus;
  syncInterval: number;
  marketType?: string | null;
  externalAccountId?: string | null;
  lastSyncAt?: Date | null;
  lastSyncError?: string | null;
  consecutiveFailures: number;
  config?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;

  user?: User;

  constructor(partial: Partial<IntegrationConnection>) {
    Object.assign(this, partial);
  }
}
