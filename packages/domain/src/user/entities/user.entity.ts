import { Space } from '../../space/entities/space.entity';

export class User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  settingsConfig?: Record<string, unknown>;
  isSystem: boolean;

  spaces?: Space[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
