import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginUserDto } from '@nucleus/domain';
import * as bcrypt from 'bcryptjs';
import { AppLogger } from '../common/logger/app-logger.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(loginUserDto: LoginUserDto) {
    this.logger.debug('Login attempt', { email: loginUserDto.email });

    const user = await this.userService.findByEmail(loginUserDto.email);
    if (!user) {
      this.logger.warn('Login failed: user not found', {
        email: loginUserDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
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

    const payload = { username: user.username, sub: user.id };

    this.logger.log('Login successful', {
      userId: user.id,
      username: user.username,
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}