import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { prisma } from "@nucleus/database";
import { LoginUserDto } from "@nucleus/domain";
import { AppLogger } from "../common/logger/app-logger.service";
import { MailService } from "../mail/mail.service";
import { comparePassword, hashPassword } from "../common/utils/password";
import { UserService } from "../user/user.service";
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
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(loginUserDto.password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn("Login failed: invalid password", {
        email: loginUserDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isVerified) {
      this.logger.warn("Login failed: email not verified", {
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedException("Please verify your email before logging in");
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.username);
    const refreshToken = await this.tokenService.createRefreshToken(user.id);

    this.logger.log("Login successful", {
      userId: user.id,
      username: user.username,
    });

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException("Refresh token not provided");
    }

    const validated = await this.tokenService.validateRefreshToken(refreshTokenRaw);

    if (!validated) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.userService.findById(validated.userId);

    const newRefreshToken = await this.tokenService.rotateRefreshToken(validated.tokenId, validated.userId);
    const newAccessToken = this.tokenService.generateAccessToken(user.id, user.username);

    this.logger.log("Token refreshed successfully", { userId: user.id });

    return {
      message: "Token refreshed successfully",
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
      message: "Logged out successfully",
      clearCookies: true,
    };
  }

  async verifyEmail(token: string) {
    const validated = await this.tokenService.validateVerificationToken(token);

    if (!validated) {
      throw new BadRequestException("Invalid or expired verification token");
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

    return { message: "Email verified successfully" };
  }

  async devResetTestData(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: `No user found for ${email} — nothing to reset` };
    }

    await prisma.user.delete({ where: { email } });

    this.logger.log("Dev: test data reset", { email });

    return { message: `Test data for ${email} deleted (cascade)` };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    this.logger.debug("Forgot password requested", { email });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid user enumeration
    if (!user) {
      this.logger.warn("Forgot password: user not found, returning generic response", { email });
      return { message: "If this email is registered, you will receive a password reset link." };
    }

    const rawToken = await this.tokenService.createPasswordResetToken(user.id);
    await this.mailService.sendPasswordResetEmail(email, rawToken);

    this.logger.log("Password reset email sent", { userId: user.id });

    return { message: "If this email is registered, you will receive a password reset link." };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.logger.debug("Reset password attempt");

    const validated = await this.tokenService.validatePasswordResetToken(token);

    if (!validated) {
      throw new BadRequestException("Invalid or expired password reset token");
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

    this.logger.log("Password reset successful", { userId: validated.userId });

    return { message: "Password reset successfully" };
  }

  async devVerifyUser(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    this.logger.log("Dev: user verified", { userId: user.id, email });

    return { message: `User ${email} verified successfully` };
  }
}
