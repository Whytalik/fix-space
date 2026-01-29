export class User {
  id: string;

  email: string;

  username: string;

  createdAt: Date;

  settingsConfig?: Record<string, any>;

  isSystem: boolean;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
