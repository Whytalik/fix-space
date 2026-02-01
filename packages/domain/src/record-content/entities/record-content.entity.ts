import { Record } from '../../record/entities/record.entity';

export class RecordContent {
  id: string;
  recordId: string;
  lastEditedAt: Date;

  record?: Record;

  constructor(partial: Partial<RecordContent>) {
    Object.assign(this, partial);
  }
}
