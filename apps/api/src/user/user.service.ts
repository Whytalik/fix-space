import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User, prisma } from "@nucleus/database";
import { ChangePasswordDto, UpdateUserDto, UserResponseDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { comparePassword, hashPassword } from "../common/utils/password";

@Injectable()
export class UserService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(UserService.name);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug("Finding user by email", { email });
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.debug("Finding user by id", { id });
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    return new UserResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.debug("Updating user", { id });
    const { password, ...rest } = dto;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password && {
          passwordHash: await hashPassword(password),
        }),
      },
    });

    this.logger.log("User updated", { id });
    return new UserResponseDto(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    this.logger.debug("Changing password", { id });

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });

    const isValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(dto.newPassword) },
    });

    this.logger.log("Password changed", { id });
    return { message: "Password changed successfully" };
  }

  async remove(id: string): Promise<UserResponseDto> {
    this.logger.debug("Removing user", { id });

    const user = await prisma.user.delete({
      where: { id },
    });

    this.logger.log("User removed", { id });
    return new UserResponseDto(user);
  }
}
