import { Exclude, Expose } from "class-transformer";

@Exclude()
export class OnboardingProgressResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  tourStep: number;

  @Expose()
  tourCompleted: boolean;

  @Expose()
  checklistItems: Record<string, unknown>[];

  @Expose()
  contextualTips: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<OnboardingProgressResponseDto>) {
    Object.assign(this, partial);
  }
}
