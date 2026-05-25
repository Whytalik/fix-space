import { IsArray, IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class UpdateOnboardingProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  tourStep?: number;

  @IsOptional()
  @IsBoolean()
  tourCompleted?: boolean;

  @IsOptional()
  @IsArray()
  checklistItems?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  contextualTips?: string[];
}
