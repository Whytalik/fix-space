export class OnboardingProgress {
  id: string;
  userId: string;
  tourStep: number;
  tourCompleted: boolean;
  checklistItems: Record<string, unknown>[];
  contextualTips: string[];
  createdAt: Date;
  updatedAt: Date;
}
