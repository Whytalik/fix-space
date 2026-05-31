import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { prisma } from "@fixspace/database";
import { LoginUserDto } from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";
import { MailService } from "../mail/mail.service";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import { UserService } from "../../modules/user/user.service";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(loginUserDto: LoginUserDto) {
    this.logger.debug("Login attempt", { email: loginUserDto.email });

    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      this.logger.warn("Login failed: user not found", {
        email: loginUserDto.email,
      });
      throw new UnauthorizedException(t("errors.INVALID_CREDENTIALS"));
    }

    const isPasswordValid = await verifyPassword(loginUserDto.password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn("Login failed: invalid password", {
        email: loginUserDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException(t("errors.INVALID_CREDENTIALS"));
    }

    if (!user.isVerified) {
      this.logger.warn("Login failed: email not verified", {
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedException(t("errors.EMAIL_NOT_VERIFIED"));
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.username);
    const refreshToken = await this.tokenService.createRefreshToken(user.id);

    this.logger.log("Login successful", {
      userId: user.id,
      username: user.username,
    });

    return {
      message: t("errors.LOGIN_SUCCESS"),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException(t("errors.REFRESH_TOKEN_NOT_PROVIDED"));
    }

    const validated = await this.tokenService.validateRefreshToken(refreshTokenRaw);

    if (!validated) {
      throw new UnauthorizedException(t("errors.INVALID_REFRESH_TOKEN"));
    }

    const user = await this.userService.findById(validated.userId);

    const newRefreshToken = await this.tokenService.rotateRefreshToken(validated.tokenId, validated.userId);
    const newAccessToken = this.tokenService.generateAccessToken(user.id, user.username);

    this.logger.log("Token refreshed successfully", { userId: user.id });

    return {
      message: t("errors.TOKEN_REFRESHED"),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenRaw: string) {
    if (refreshTokenRaw) {
      await this.tokenService.revokeRefreshToken(refreshTokenRaw);
    }

    this.logger.log("Logout successful");

    return {
      message: t("errors.LOGOUT_SUCCESS"),
      clearCookies: true,
    };
  }

  async verifyEmail(token: string) {
    const validated = await this.tokenService.validateVerificationToken(token);

    if (!validated) {
      throw new BadRequestException(t("errors.INVALID_VERIFICATION_TOKEN"));
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: validated.userId },
        data: { isVerified: true },
      });

      await tx.emailVerificationToken.update({
        where: { id: validated.tokenId },
        data: { usedAt: new Date() },
      });
    });

    this.logger.log("Email verified successfully", {
      userId: validated.userId,
    });

    return { message: t("errors.EMAIL_VERIFIED") };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: t("errors.REGISTRATION_SUCCESS") };
    }

    if (user.isVerified) {
      return { message: t("errors.EMAIL_VERIFIED") };
    }

    const lastToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastToken) {
      const diff = Date.now() - lastToken.createdAt.getTime();
      if (diff < 60000) {
        throw new BadRequestException(t("errors.COOLDOWN_ACTIVE", { seconds: Math.ceil((60000 - diff) / 1000) }));
      }
    }

    const verificationToken = await this.tokenService.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.username, verificationToken);

    return { message: t("errors.REGISTRATION_SUCCESS") };
  }

  async devResetTestData(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: t("errors.DEV_USER_NOT_FOUND", { email }) };
    }

    await prisma.user.delete({ where: { email } });

    this.logger.log("Dev: test data reset", { email });

    return { message: t("errors.DEV_DATA_RESET", { email }) };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    this.logger.debug("Forgot password requested", { email });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn("Forgot password: user not found, returning generic response", { email });
      return { message: t("errors.PASSWORD_RESET_GENERIC") };
    }

    const rawToken = await this.tokenService.createPasswordResetToken(user.id);
    await this.mailService.sendPasswordResetEmail(email, rawToken);

    this.logger.log("Password reset email sent", { userId: user.id });

    return { message: t("errors.PASSWORD_RESET_GENERIC") };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.logger.debug("Reset password attempt");

    const validated = await this.tokenService.validatePasswordResetToken(token);

    if (!validated) {
      throw new BadRequestException(t("errors.INVALID_PASSWORD_RESET_TOKEN"));
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: validated.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: validated.tokenId },
        data: { usedAt: new Date() },
      });
    });

    await this.tokenService.revokeAllUserRefreshTokens(validated.userId);

    const user = await prisma.user.findUnique({ where: { id: validated.userId } });
    if (user) {
      await this.mailService.sendPasswordChangeNotification(user.email);
    }

    this.logger.log("Password reset successful", { userId: validated.userId });

    return { message: t("errors.PASSWORD_RESET_SUCCESS") };
  }

  async devVerifyUser(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(t("errors.USER_NOT_FOUND"));
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    this.logger.log("Dev: user verified", { userId: user.id, email });

    return { message: t("errors.DEV_USER_VERIFIED", { email }) };
  }
}
