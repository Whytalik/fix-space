import { Section } from '../../section/entities/section.entity';
import { Space } from '../../space/entities/space.entity';

export class Database {
  id: string;
  spaceId: string;
  name: string;
  title: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  sectionId?: string;
  config?: Record<string, unknown>;

  space?: Space;
  section?: Section;

  constructor(partial: Partial<Database>) {
    Object.assign(this, partial);
  }
}
