import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export enum AutomationStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  SKIPPED = "SKIPPED",
}

@Exclude()
export class AutomationLogResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "Automation ID", example: "clx123..." })
  @Expose()
  automationId: string;

  @ApiProperty({ description: "Source record ID", example: "clx123...", nullable: true })
  @Expose()
  sourceRecordId: string | null;

  @ApiProperty({ description: "Execution status", enum: AutomationStatus, example: AutomationStatus.SUCCESS })
  @Expose()
  status: AutomationStatus;

  @ApiProperty({ description: "Result message", example: "Completed successfully", nullable: true })
  @Expose()
  result: string | null;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<AutomationLogResponseDto>) {
    Object.assign(this, partial);
  }
}
