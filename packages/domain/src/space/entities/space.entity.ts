import { Database } from '../../database/entities/database.entity';
import { Section } from '../../section/entities/section.entity';
import { User } from '../../user/entities/user.entity';

export class Space {
  id: string;
  ownerId: string;
  name: string;
  icon?: string;
  createdAt: Date;
  config?: Record<string, unknown>;

  owner?: User;
  sections?: Section[];
  databases?: Database[];

  constructor(partial: Partial<Space>) {
    Object.assign(this, partial);
  }
}
