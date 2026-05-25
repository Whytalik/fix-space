import { Exclude, Expose } from "class-transformer";

export enum NotificationType {
  SYSTEM = "SYSTEM",
  ALERT = "ALERT",
  INTEGRATION = "INTEGRATION",
}

@Exclude()
export class NotificationResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  type: NotificationType;

  @Expose()
  text: string;

  @Expose()
  isRead: boolean;

  @Expose()
  link: string | null;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<NotificationResponseDto>) {
    Object.assign(this, partial);
  }
}
