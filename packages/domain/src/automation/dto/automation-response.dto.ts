import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { AutomationTrigger } from "./create-automation.dto";

@Exclude()
export class AutomationResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID", example: "clx123..." })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Automation name", example: "My Automation" })
  @Expose()
  name: string;

  @ApiProperty({ description: "Trigger type", enum: AutomationTrigger, example: AutomationTrigger.ON_RECORD_CREATE })
  @Expose()
  trigger: AutomationTrigger;

  @ApiProperty({ description: "Condition object", example: {} })
  @Expose()
  condition: unknown;

  @ApiProperty({ description: "Actions array", example: [] })
  @Expose()
  actions: unknown;

  @ApiProperty({ description: "Whether automation is active", example: true })
  @Expose()
  active: boolean;

  @ApiProperty({ description: "Additional configuration", example: {}, required: false })
  @Expose()
  config?: unknown;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AutomationResponseDto>) {
    Object.assign(this, partial);
  }
}
