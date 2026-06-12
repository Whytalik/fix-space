import type { ContentSchema } from "../types/content-schema.types";

export class RecordContent {
  id: string;
  recordId: string;
  content: ContentSchema;
  lastEditedAt: Date;

  constructor(partial: Partial<RecordContent>) {
    Object.assign(this, partial);
  }
}
