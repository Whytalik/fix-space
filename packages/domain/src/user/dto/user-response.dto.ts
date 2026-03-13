import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  icon: string | null;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  settingsConfig?: unknown;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
