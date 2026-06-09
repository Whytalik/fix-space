import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma, type User } from "@fixspace/database";
import { ChangePasswordDto, DeleteAccountDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { verifyPassword, hashPassword } from "@/common/utils/password";
import { StorageService } from "./providers/storage.service";
import { UserRepository } from "./repositories/user.repository";
import { TokenService } from "@/core/auth/token.service";
import { MailService } from "@/core/mail/mail.service";

@Injectable()
export class UserService {
  constructor(
    private readonly logger: AppLogger,
    private readonly storageService: StorageService,
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
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

    const updateData: Prisma.UserUpdateInput = filterUndefined({ fields: rest });
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const user = await this.userRepo.update(id, updateData);

    this.logger.log("User updated", { id });
    return new UserResponseDto(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    this.logger.debug("Changing password", { id });

    const user = await this.userRepo.findByIdOrThrow(id);

    if (!user.passwordHash) {
      throw new UnauthorizedException(t("errors.CURRENT_PASSWORD_INCORRECT"));
    }

    const isValid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(t("errors.CURRENT_PASSWORD_INCORRECT"));
    }

    await this.userRepo.update(id, { passwordHash: await hashPassword(dto.newPassword) });

    await this.tokenService.revokeAllUserRefreshTokens(id);
    await this.mailService.sendPasswordChangeNotification(user.email);

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
    } catch (error) {
      await this.storageService.removeAvatarFiles(id);
      throw error;
    }
  }

  async removeAvatar(id: string): Promise<UserResponseDto> {
    this.logger.debug("Removing avatar", { id });
    const user = await this.userRepo.update(id, { icon: null });
    await this.storageService.removeAvatarFiles(id);
    this.logger.log("Avatar removed", { id });
    return new UserResponseDto(user);
  }

  async remove(id: string, dto: DeleteAccountDto): Promise<{ message: string }> {
    this.logger.debug("Removing user", { id });

    const user = await this.userRepo.findByIdOrThrow(id);

    if (user.passwordHash) {
      if (!dto.password) {
        throw new UnauthorizedException(t("errors.INVALID_CREDENTIALS"));
      }
      const isValid = await verifyPassword(dto.password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException(t("errors.INVALID_CREDENTIALS"));
      }
    }

    const email = user.email;

    await this.storageService.removeAvatarFiles(id);
    await this.userRepo.delete(id);

    this.logger.log("User removed", { id });

    await this.mailService.sendAccountDeletionNotification(email);

    return { message: "Account deleted successfully" };
  }
}
