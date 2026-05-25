import { Exclude, Expose } from "class-transformer";

export enum AutomationStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  SKIPPED = "SKIPPED",
}

@Exclude()
export class AutomationLogResponseDto {
  @Expose()
  id: string;

  @Expose()
  automationId: string;

  @Expose()
  sourceRecordId: string | null;

  @Expose()
  status: AutomationStatus;

  @Expose()
  result: string | null;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<AutomationLogResponseDto>) {
    Object.assign(this, partial);
  }
}
