import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class OnboardingProgressResponseDto {
  @ApiProperty({ description: "Unique onboarding progress identifier", example: "o7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "User identifier", example: "u7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  userId: string;

  @ApiProperty({ description: "Current tour step index", example: 3, required: true })
  @Expose()
  tourStep: number;

  @ApiProperty({ description: "Whether the onboarding tour is completed", example: false, required: true })
  @Expose()
  tourCompleted: boolean;

  @ApiProperty({ description: "Checklist items with completion status", required: true })
  @Expose()
  checklistItems: Record<string, unknown>[];

  @ApiProperty({ description: "Contextual tips shown to the user", example: ["tip1", "tip2"], required: true })
  @Expose()
  contextualTips: string[];

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Record last update timestamp", required: true })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<OnboardingProgressResponseDto>) {
    Object.assign(this, partial);
  }
}
