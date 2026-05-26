import { Injectable, UnauthorizedException } from "@nestjs/common";
import { type User } from "@fixspace/database";
import { ChangePasswordDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { comparePassword, hashPassword } from "../common/utils/password";
import { StorageService } from "./storage.service";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly logger: AppLogger,
    private readonly storageService: StorageService,
    private readonly userRepo: UserRepository,
  ) {
    this.logger.setContext(UserService.name);
  }

  async findByEmail(email: string): Promise<Omit<User, "passwordHash"> | null> {
    this.logger.debug("Finding user by email", { email });
    return this.userRepo.findByEmail(email);
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.debug("Finding user by id", { id });
    const user = await this.userRepo.findByIdOrThrow(id);
    return new UserResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.debug("Updating user", { id });
    const { password, ...rest } = dto;

    const user = await this.userRepo.update(id, {
      ...rest,
      ...(password && {
        passwordHash: await hashPassword(password),
      }),
    });

    this.logger.log("User updated", { id });
    return new UserResponseDto(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    this.logger.debug("Changing password", { id });

    const user = await this.userRepo.findByIdOrThrow(id);

    const isValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    await this.userRepo.update(id, { passwordHash: await hashPassword(dto.newPassword) });

    this.logger.log("Password changed", { id });
    return { message: "Password changed successfully" };
  }

  async updateAvatar(id: string, file: Express.Multer.File): Promise<UserResponseDto> {
    this.logger.debug("Updating avatar", { id });
    const iconPath = await this.storageService.saveAvatar(id, file);
    try {
      const user = await this.userRepo.update(id, { icon: iconPath });
      this.logger.log("Avatar updated", { id });
      return new UserResponseDto(user);
    } catch (err) {
      await this.storageService.removeAvatarFiles(id);
      throw err;
    }
  }

  async removeAvatar(id: string): Promise<UserResponseDto> {
    this.logger.debug("Removing avatar", { id });
    const user = await this.userRepo.update(id, { icon: null });
    await this.storageService.removeAvatarFiles(id);
    this.logger.log("Avatar removed", { id });
    return new UserResponseDto(user);
  }

  async remove(id: string): Promise<UserResponseDto> {
    this.logger.debug("Removing user", { id });

    await this.storageService.removeAvatarFiles(id);

    const user = await this.userRepo.delete(id);

    this.logger.log("User removed", { id });
    return new UserResponseDto(user);
  }
}
