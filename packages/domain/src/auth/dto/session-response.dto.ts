import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SessionResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  expiresAt: Date;

  @Expose()
  isCurrent?: boolean;

  constructor(partial: Partial<SessionResponseDto>) {
    Object.assign(this, partial);
  }
}
