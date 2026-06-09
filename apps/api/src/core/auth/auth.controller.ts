import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DevVerifyUserDto, ForgotPasswordDto, LoginUserDto, RegisterUserDto, ResetPasswordDto, VerifyEmailDto } from "@fixspace/domain";
import { Request } from "express";
import { AuthCookiesInterceptor } from "./interceptors/auth-cookies.interceptor";
import { AuthService } from "./auth.service";
import { DevOnly } from "./decorators/dev-only.decorator";
import { Public } from "./decorators/public.decorator";
import { RegisterUserUseCase } from "./providers/register-user.usecase";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GoogleUser } from "./strategies/google.strategy";

@ApiTags("Auth")
@Controller("auth")
@UseInterceptors(AuthCookiesInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserUseCase.register(registerUserDto);
  }

  @Public()
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email address" })
  async verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification email" })
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user and get tokens" })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(@Req() req: Request, @Body() body: { refreshToken?: string }) {
    const refreshToken = (req.cookies?.["refresh_token"] as string) || body?.refreshToken;
    return this.authService.refresh(refreshToken!);
  }

  @ApiBearerAuth("access-token")
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user and invalidate session" })
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.["refresh_token"] as string;
    return this.authService.logout(refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset email" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  async googleAuth() {}

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Handle Google OAuth callback and issue session" })
  async googleCallback(@Req() req: Request) {
    const result = await this.authService.loginWithGoogle(req.user as GoogleUser);
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    return {
      ...result,
      redirectUrl: `${appUrl}?token=${encodeURIComponent(result.accessToken)}`,
    };
  }

  @Public()
  @Post("set-session")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set session cookie from access token (OAuth bridge)" })
  setSession(@Body("accessToken") accessToken: string) {
    try {
      this.jwtService.verify(accessToken);
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
    return { accessToken };
  }

  @DevOnly()
  @Post("dev/verify-user")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "[DEV] Verify user by email" })
  async devVerifyUser(@Body() dto: DevVerifyUserDto) {
    return this.authService.devVerifyUser(dto.email);
  }

  @DevOnly()
  @Post("dev/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "[DEV] Reset test data for user" })
  async devResetTestData(@Body() dto: DevVerifyUserDto) {
    return this.authService.devResetTestData(dto.email);
  }
}
