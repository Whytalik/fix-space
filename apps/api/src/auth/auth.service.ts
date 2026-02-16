import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@nucleus/database';
import { LoginUserDto } from '@nucleus/domain';
import { Response } from 'express';
import { AppLogger } from '../common/logger/app-logger.service';
import {
  clearAuthCookies,
  CookieOptions,
  parseDurationToMs,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../common/utils/cookie.helper';
import { comparePassword } from '../common/utils/password';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(
    loginUserDto: LoginUserDto,
    res: Response,
  ): Promise<{ message: string }> {
    this.logger.debug('Login attempt', { email: loginUserDto.email });

    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      this.logger.warn('Login failed: user not found', {
        email: loginUserDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn('Login failed: invalid password', {
        email: loginUserDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      this.logger.warn('Login failed: email not verified', {
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.username,
    );
    const refreshToken = await this.tokenService.createRefreshToken(user.id);

    // Set cookies
    const cookieOpts = this.getCookieOptions();
    setAccessTokenCookie(
      res,
      accessToken,
      parseDurationToMs(
        this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      ),
      cookieOpts,
    );
    setRefreshTokenCookie(
      res,
      refreshToken,
      parseDurationToMs(this.configService.get('JWT_REFRESH_EXPIRATION', '7d')),
      cookieOpts,
    );

    this.logger.log('Login successful', {
      userId: user.id,
      username: user.username,
    });

    return { message: 'Login successful' };
  }

  async refresh(
    refreshTokenRaw: string,
    res: Response,
  ): Promise<{ message: string }> {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const validated =
      await this.tokenService.validateRefreshToken(refreshTokenRaw);

    if (!validated) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.findById(validated.userId);

    // Rotate refresh token
    const newRefreshToken = await this.tokenService.rotateRefreshToken(
      validated.tokenId,
      validated.userId,
    );
    const newAccessToken = this.tokenService.generateAccessToken(
      user.id,
      user.username,
    );

    // Set new cookies
    const cookieOpts = this.getCookieOptions();
    setAccessTokenCookie(
      res,
      newAccessToken,
      parseDurationToMs(
        this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      ),
      cookieOpts,
    );
    setRefreshTokenCookie(
      res,
      newRefreshToken,
      parseDurationToMs(this.configService.get('JWT_REFRESH_EXPIRATION', '7d')),
      cookieOpts,
    );

    this.logger.log('Token refreshed successfully', { userId: user.id });

    return { message: 'Token refreshed successfully' };
  }

  async logout(
    refreshTokenRaw: string,
    res: Response,
  ): Promise<{ message: string }> {
    if (refreshTokenRaw) {
      await this.tokenService.revokeRefreshToken(refreshTokenRaw);
    }

    clearAuthCookies(res, this.getCookieOptions());

    this.logger.log('Logout successful');

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const validated = await this.tokenService.validateVerificationToken(token);

    if (!validated) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: validated.userId },
      data: { isVerified: true },
    });

    await this.tokenService.markVerificationTokenUsed(validated.tokenId);

    this.logger.log('Email verified successfully', {
      userId: validated.userId,
    });

    return { message: 'Email verified successfully' };
  }

  private getCookieOptions(): CookieOptions {
    return {
      domain: this.configService.get('COOKIE_DOMAIN', 'localhost'),
      secure: this.configService.get('NODE_ENV') === 'production',
    };
  }
}