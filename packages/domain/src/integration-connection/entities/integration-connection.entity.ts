import type { User } from "../../user/entities/user.entity";
import type { IntegrationService } from "../dto/create-integration-connection.dto";
import type { IntegrationStatus } from "../dto/update-integration-connection.dto";

export class IntegrationConnection {
  id: string;
  userId: string;
  service: IntegrationService;
  name: string;
  credentials: Record<string, unknown>;
  status: IntegrationStatus;
  syncInterval: number;
  marketType?: string;
  externalAccountId?: string;
  lastSyncAt?: Date;
  lastSyncError?: string;
  consecutiveFailures: number;
  createdAt: Date;
  updatedAt: Date;

  user?: User;

  constructor(partial: Partial<IntegrationConnection>) {
    Object.assign(this, partial);
  }
}
