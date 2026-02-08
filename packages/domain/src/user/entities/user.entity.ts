import { Space } from '../../space/entities/space.entity';

export class User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  icon?: string;
  createdAt: Date;

  spaces?: Space[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
