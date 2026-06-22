import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";

import { type User } from "@fixspace/database";
import { ChangePasswordDto, DeleteAccountDto, SetPasswordDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";

import { AppLogger } from "@/common/logger/app-logger.service";
import { filterUndefined } from "@/common/utils/filter-undefined";
import { t } from "@/common/utils/i18n.helper";
import { verifyPassword, hashPassword } from "@/common/utils/password";

import { MailService } from "@/core/mail/mail.service";
import { StorageService } from "@/core/storage/storage.service";
import { TokenService } from "@/core/auth/token.service";

import { UserRepository } from "./repositories/user.repository";
import { toUserResponse } from "./utils/to-user-response.util";

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
    return toUserResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.debug("Updating user", { id });
    const { email, username, icon } = dto;
    const user = await this.userRepo.update(id, filterUndefined({ fields: { email, username, icon } }));
    this.logger.log("User updated", { id });
    return toUserResponse(user);
  }

  async setPassword(id: string, dto: SetPasswordDto): Promise<{ message: string }> {
    this.logger.debug("Setting password for OAuth user", { id });

    const user = await this.userRepo.findByIdOrThrow(id);

    if (user.passwordHash) {
      throw new BadRequestException(t("errors.PASSWORD_ALREADY_SET"));
    }

    await this.userRepo.update(id, { passwordHash: await hashPassword(dto.password) });

    this.logger.log("Password set", { id });
    return { message: t("errors.PASSWORD_SET_SUCCESS") };
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
    return { message: t("errors.PASSWORD_CHANGED_SUCCESS") };
  }

  async updateAvatar(id: string, file: Express.Multer.File): Promise<UserResponseDto> {
    this.logger.debug("Updating avatar", { id });
    const iconPath = await this.storageService.saveAvatar(id, file);
    try {
      const user = await this.userRepo.update(id, { icon: iconPath });
      this.logger.log("Avatar updated", { id });
      return toUserResponse(user);
    } catch (error) {
      await this.storageService.removeAvatarFiles(id);
      throw error;
    }
  }

  async removeAvatar(id: string): Promise<UserResponseDto> {
    this.logger.debug("Removing avatar", { id });
    try {
      await this.storageService.removeAvatarFiles(id);
    } catch (error) {
      this.logger.warn("Failed to remove avatar files from storage", { id, error });
    }
    const user = await this.userRepo.update(id, { icon: null });
    this.logger.log("Avatar removed", { id });
    return toUserResponse(user);
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

    return { message: t("errors.ACCOUNT_DELETED") };
  }
}
