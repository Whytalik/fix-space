import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../common/logger/app-logger.service";
import { parseDurationToMs } from "../common/utils/cookie.helper";
import { generateRandomToken, hashToken } from "../common/utils/token.helper";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(TokenService.name);
  }

  generateAccessToken(userId: string, username: string): string {
    const payload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }

  async createRefreshToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + parseDurationToMs(this.configService.get("JWT_REFRESH_EXPIRATION", "7d")));

    await prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    this.logger.debug("Refresh token created", { userId });

    return rawToken;
  }

  async validateRefreshToken(rawToken: string): Promise<{ userId: string; tokenId: string } | null> {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      this.logger.warn("Invalid or expired refresh token");
      return null;
    }

    return { userId: record.userId, tokenId: record.id };
  }

  async rotateRefreshToken(oldTokenId: string, userId: string): Promise<string> {
    await prisma.refreshToken.update({
      where: { id: oldTokenId },
      data: { revokedAt: new Date() },
    });

    this.logger.debug("Old refresh token revoked", { tokenId: oldTokenId });

    return this.createRefreshToken(userId);
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.debug("Refresh token revoked by hash");
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log("All refresh tokens revoked for user", { userId });
  }

  async createVerificationToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const hours = this.configService.get<number>("VERIFICATION_TOKEN_EXPIRATION_HOURS", 24);
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    this.logger.debug("Verification token created", { userId });

    return rawToken;
  }

  async validateVerificationToken(rawToken: string): Promise<{ userId: string; tokenId: string } | null> {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      this.logger.warn("Invalid or expired verification token");
      return null;
    }

    return { userId: record.userId, tokenId: record.id };
  }

  async markVerificationTokenUsed(tokenId: string): Promise<void> {
    await prisma.emailVerificationToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });

    this.logger.debug("Verification token marked as used", { tokenId });
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    this.logger.debug("Password reset token created", { userId });

    return rawToken;
  }

  async validatePasswordResetToken(rawToken: string): Promise<{ userId: string; tokenId: string } | null> {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      this.logger.warn("Invalid or expired password reset token");
      return null;
    }

    return { userId: record.userId, tokenId: record.id };
  }

  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });

    this.logger.debug("Password reset token marked as used", { tokenId });
  }
}
