import type { Database } from "../../database/entities/database.entity";
import type { AutomationStatus } from "../dto/automation-log-response.dto";
import type { AutomationTrigger } from "../dto/create-automation.dto";

export class Automation {
  id: string;
  databaseId: string;
  name: string;
  trigger: AutomationTrigger;
  condition?: unknown;
  actions: unknown;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, unknown>;

  database?: Database;
  logs?: AutomationLog[];

  constructor(partial: Partial<Automation>) {
    Object.assign(this, partial);
  }
}

export class AutomationLog {
  id: string;
  automationId: string;
  sourceRecordId?: string;
  status: AutomationStatus;
  result?: string;
  createdAt: Date;

  automation?: Automation;

  constructor(partial: Partial<AutomationLog>) {
    Object.assign(this, partial);
  }
}
