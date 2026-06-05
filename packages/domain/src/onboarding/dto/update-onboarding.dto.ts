import { IsArray, IsBoolean, IsInt, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateOnboardingProgressDto {
  @ApiProperty({ description: "Current tour step index", example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  tourStep?: number;

  @ApiProperty({ description: "Whether the onboarding tour is completed", example: true, required: false })
  @IsOptional()
  @IsBoolean()
  tourCompleted?: boolean;

  @ApiProperty({ description: "Checklist items with completion status", required: false })
  @IsOptional()
  @IsArray()
  checklistItems?: Record<string, unknown>[];

  @ApiProperty({ description: "Contextual tips to show the user", example: ["tip1", "tip2"], required: false })
  @IsOptional()
  @IsArray()
  contextualTips?: string[];
}
