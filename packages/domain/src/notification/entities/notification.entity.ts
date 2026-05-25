import type { User } from "../../user/entities/user.entity";
import type { NotificationType } from "../dto/notification-response.dto";

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  text: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;

  user?: User;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
