import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { LoginUserDto, RegisterUserDto, VerifyEmailDto } from '@nucleus/domain';
import { AuthCookiesInterceptor } from '../common/interceptors/auth-cookies.interceptor';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterUserService } from './register-user.usecase';

@Controller('auth')
@UseInterceptors(AuthCookiesInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUserService: RegisterUserService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserService.register(registerUserDto);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any) {
    const refreshToken = req.cookies?.['refresh_token'];
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    const refreshToken = req.cookies?.['refresh_token'];
    return this.authService.logout(refreshToken);
  }

  @Public()
  @Post('dev/verify-user')
  @HttpCode(HttpStatus.OK)
  async devVerifyUser(@Body('email') email: string) {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new ForbiddenException('Available in development only');
    }
    return this.authService.devVerifyUser(email);
  }

  @Public()
  @Post('dev/reset')
  @HttpCode(HttpStatus.OK)
  async devResetTestData(@Body('email') email: string) {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new ForbiddenException('Available in development only');
    }
    return this.authService.devResetTestData(email);
  }
}
