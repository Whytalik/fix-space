export class UserResponseDto {
  id: string;

  email: string;

  username:string;

  createdAt: Date;

  settingsConfig?: Record<string, any>;

  isSystem: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
