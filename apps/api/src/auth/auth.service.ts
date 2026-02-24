import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { LoginUserDto } from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { comparePassword } from '../common/utils/password';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(loginUserDto: LoginUserDto) {
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

    this.logger.log('Login successful', {
      userId: user.id,
      username: user.username,
    });

    // Return tokens - interceptor will set cookies
    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenRaw: string) {
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

    this.logger.log('Token refreshed successfully', { userId: user.id });

    // Return tokens - interceptor will set cookies
    return {
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenRaw: string) {
    if (refreshTokenRaw) {
      await this.tokenService.revokeRefreshToken(refreshTokenRaw);
    }

    this.logger.log('Logout successful');

    // Return clearCookies flag - interceptor will clear cookies
    return {
      message: 'Logged out successfully',
      clearCookies: true,
    };
  }

  async verifyEmail(token: string) {
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

  async devResetTestData(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: `No user found for ${email} — nothing to reset` };
    }

    await prisma.user.delete({ where: { email } });

    this.logger.log('Dev: test data reset', { email });

    return { message: `Test data for ${email} deleted (cascade)` };
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

    this.logger.log('Dev: user verified', { userId: user.id, email });

    return { message: `User ${email} verified successfully` };
  }
}
