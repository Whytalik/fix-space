import { User } from 'entry';

export class Space {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date;
  config?: Record<string, any>;

  owner?: User;
}
