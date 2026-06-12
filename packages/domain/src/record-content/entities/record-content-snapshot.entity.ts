import type { ContentSchema } from "../types/content-schema.types";

export class RecordContentSnapshot {
  id: string;
  recordContentId: string;
  content: ContentSchema;
  createdAt: Date;

  constructor(partial: Partial<RecordContentSnapshot>) {
    Object.assign(this, partial);
  }
}
