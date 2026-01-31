import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;

  @Expose()
  settingsConfig?: Record<string, unknown>;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
