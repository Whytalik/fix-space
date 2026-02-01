import { Database } from '../../database/entities/database.entity';
import { PropertyValue } from '../../property-value/entities/property-value.entity';
import { RecordContent } from '../../record-content/entities/record-content.entity';

export class Record {
  id: string;
  databaseId: string;
  createdAt: Date;
  updatedAt: Date;

  database?: Database;
  values?: PropertyValue[];
  content?: RecordContent;

  constructor(partial: Partial<Record>) {
    Object.assign(this, partial);
  }
}
