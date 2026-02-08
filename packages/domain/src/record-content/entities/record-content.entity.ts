import { DatabaseRecord } from '../../record/entities/record.entity';

export class RecordContent {
  id: string;
  recordId: string;
  lastEditedAt: Date;
  config?: Record<string, unknown>;

  record?: DatabaseRecord;

  constructor(partial: Partial<RecordContent>) {
    Object.assign(this, partial);
  }
}
