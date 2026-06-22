import { type User } from "@fixspace/database";
import { UserResponseDto } from "@fixspace/domain";

export function toUserResponse(user: User): UserResponseDto {
  return new UserResponseDto({
    id: user.id,
    email: user.email,
    username: user.username,
    icon: user.icon,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    hasPassword: !!user.passwordHash,
  });
}
