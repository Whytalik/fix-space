import { Exclude, Expose } from "class-transformer";
import { AutomationTrigger } from "./create-automation.dto";

@Exclude()
export class AutomationResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  trigger: AutomationTrigger;

  @Expose()
  condition: unknown;

  @Expose()
  actions: unknown;

  @Expose()
  active: boolean;

  @Expose()
  config?: unknown;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AutomationResponseDto>) {
    Object.assign(this, partial);
  }
}
