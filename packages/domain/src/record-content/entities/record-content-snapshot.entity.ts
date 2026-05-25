export class RecordContentSnapshot {
  id: string;
  recordContentId: string;
  content: unknown;
  createdAt: Date;

  constructor(partial: Partial<RecordContentSnapshot>) {
    Object.assign(this, partial);
  }
}
