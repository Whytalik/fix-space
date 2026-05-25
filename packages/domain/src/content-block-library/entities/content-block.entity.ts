export class ContentBlock {
  id: string;
  userId: string;
  name: string;
  content: unknown;
  isSystem: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ContentBlock>) {
    Object.assign(this, partial);
  }
}
