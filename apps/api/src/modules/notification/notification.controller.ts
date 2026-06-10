import { Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { NotificationResponseDto, UnreadCountResponseDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { NotificationService } from "./notification.service";

@ApiTags("Notifications")
@ApiBearerAuth("access-token")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for current user (max 50)" })
  @ApiResponse({ status: 200, description: "Notifications retrieved.", type: [NotificationResponseDto] })
  findAll(@CurrentUser("userId") userId: string) {
    return this.notificationService.findAll(userId);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get count of unread notifications" })
  @ApiResponse({ status: 200, description: "Unread count retrieved.", type: UnreadCountResponseDto })
  getUnreadCount(@CurrentUser("userId") userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch("mark-all-as-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read." })
  markAllAsRead(@CurrentUser("userId") userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a specific notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read.", type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: "Notification not found." })
  markAsRead(@CurrentUser("userId") userId: string, @Param("id") id: string) {
    return this.notificationService.markAsRead(userId, id);
  }

  @Delete()
  @ApiOperation({ summary: "Delete all notifications for current user" })
  @ApiResponse({ status: 200, description: "All notifications deleted." })
  deleteAll(@CurrentUser("userId") userId: string) {
    return this.notificationService.deleteAll(userId);
  }
}
