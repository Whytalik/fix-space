import { ApiProperty } from "@nestjs/swagger";
import type { DatabaseType } from "./create-database.dto";

export class AvailablePresetTypeDto {
  @ApiProperty({ enum: ["trading-journal"], description: "Preset database type" })
  type: DatabaseType;

  @ApiProperty({ description: "Human-readable title", example: "Trading Journal" })
  title: string;

  @ApiProperty({ description: "Database icon identifier", example: "icon:BookOpen" })
  icon: string;
}
