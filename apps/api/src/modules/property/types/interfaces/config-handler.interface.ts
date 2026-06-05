import type { PropertyType } from "@fixspace/domain";

export interface PropertyConfigHandler {
  readonly type: PropertyType;
  getDefaultConfig(): Record<string, unknown>;
  validateConfig(config: Record<string, unknown>): string[] | null;
}
