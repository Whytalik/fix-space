import { Property } from '../../property/entities/property.entity';
import { Record } from '../../record/entities/record.entity';

export class PropertyValue {
  id: string;
  recordId: string;
  propertyId: string;
  value?: unknown;
  computed: boolean;

  record?: Record;
  property?: Property;

  constructor(partial: Partial<PropertyValue>) {
    Object.assign(this, partial);
  }
}
