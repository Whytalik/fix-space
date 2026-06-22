import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export enum NotificationType {
  INFO = "INFO",
  ERROR = "ERROR",
  AUTOMATION = "AUTOMATION",
  INTEGRATION = "INTEGRATION",
}

@Exclude()
export class NotificationResponseDto {
  @ApiProperty({ description: "Unique notification identifier", example: "n7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "User who receives the notification", example: "u7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  userId: string;

  @ApiProperty({ description: "Notification type", example: "INFO", required: true })
  @Expose()
  type: NotificationType;

  @ApiProperty({ description: "Notification text content", example: "Your import has completed", required: true })
  @Expose()
  text: string;

  @ApiProperty({ description: "Whether the notification has been read", example: false, required: true })
  @Expose()
  isRead: boolean;

  @ApiProperty({ description: "Optional link associated with the notification", example: "/imports/123", required: true, nullable: true })
  @Expose()
  link: string | null;

  @ApiProperty({ description: "Record creation timestamp", required: true })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<NotificationResponseDto>) {
    Object.assign(this, partial);
  }
}
