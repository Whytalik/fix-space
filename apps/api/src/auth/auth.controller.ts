import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseInterceptors } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ForgotPasswordDto, LoginUserDto, RegisterUserDto, ResetPasswordDto, VerifyEmailDto } from "@nucleus/domain";
import { Request } from "express";
import { AuthCookiesInterceptor } from "../common/interceptors/auth-cookies.interceptor";
import { AuthService } from "./auth.service";
import { DevOnly } from "./decorators/dev-only.decorator";
import { Public } from "./decorators/public.decorator";
import { RegisterUserUseCase } from "./providers/register-user.usecase";

@Controller("auth")
@UseInterceptors(AuthCookiesInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserUseCase.register(registerUserDto);
  }

  @Public()
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.["refresh_token"] as string;
    return this.authService.refresh(refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.["refresh_token"] as string;
    return this.authService.logout(refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @DevOnly()
  @Post("dev/verify-user")
  @HttpCode(HttpStatus.OK)
  async devVerifyUser(@Body("email") email: string) {
    return this.authService.devVerifyUser(email);
  }

  @DevOnly()
  @Post("dev/reset")
  @HttpCode(HttpStatus.OK)
  async devResetTestData(@Body("email") email: string) {
    return this.authService.devResetTestData(email);
  }
}
