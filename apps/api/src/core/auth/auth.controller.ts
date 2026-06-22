import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DevVerifyUserDto, ForgotPasswordDto, LoginUserDto, RegisterUserDto, ResetPasswordDto, VerifyEmailDto } from "@fixspace/domain";
import { Request } from "express";
import { AuthCookiesInterceptor } from "./interceptors/auth-cookies.interceptor";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { DevOnly } from "./decorators/dev-only.decorator";
import { Public } from "./decorators/public.decorator";
import { RegisterUserUseCase } from "./providers/register-user.usecase";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GoogleUser } from "./strategies/google.strategy";
import { readRefreshTokenCookie } from "./utils/cookie.helper";

@ApiTags("Auth")
@Controller("auth")
@UseInterceptors(AuthCookiesInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: "User registered. Verification email sent." })
  @ApiResponse({ status: 400, description: "Validation failed." })
  @ApiResponse({ status: 409, description: "Email or username already taken." })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserUseCase.register(registerUserDto);
  }

  @Public()
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email address" })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: "Email verified successfully." })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token." })
  verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification email" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: "Verification email sent (or silently skipped if email not found / already verified)." })
  @ApiResponse({ status: 400, description: "Cooldown active — wait before resending." })
  resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user and get tokens" })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: "Login successful. Returns access + refresh tokens." })
  @ApiResponse({ status: 401, description: "Invalid credentials or email not verified." })
  @ApiResponse({ status: 429, description: "Too many login attempts." })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "New access + refresh token pair issued." })
  @ApiResponse({ status: 401, description: "Refresh token missing, invalid, or revoked." })
  refresh(@Req() req: Request, @Body() body: { refreshToken?: string }) {
    const refreshToken = (readRefreshTokenCookie(req) as string) || body?.refreshToken;
    return this.authService.refresh(refreshToken!);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Logout user and invalidate session" })
  @ApiResponse({ status: 200, description: "Session terminated. Refresh token revoked." })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  logout(@Req() req: Request) {
    return this.authService.logout(readRefreshTokenCookie(req) as string);
  }

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Logout from all devices (revoke all refresh tokens)" })
  @ApiResponse({ status: 200, description: "All sessions terminated." })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  logoutAll(@CurrentUser("userId") userId: string) {
    return this.authService.logoutAll(userId);
  }

  @Get("sessions")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "List active sessions for the current user" })
  @ApiResponse({ status: 200, description: "Array of active sessions." })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  getSessions(@Req() req: Request, @CurrentUser("userId") userId: string) {
    return this.authService.getSessions(userId, readRefreshTokenCookie(req));
  }

  @Delete("sessions/:id")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Revoke a specific session by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Session revoked." })
  @ApiResponse({ status: 404, description: "Session not found." })
  @ApiResponse({ status: 401, description: "Missing or invalid access token." })
  revokeSession(@Param("id") tokenId: string, @CurrentUser("userId") userId: string) {
    return this.authService.revokeSession(userId, tokenId);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset email" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: "Generic response regardless of whether the email exists (security)." })
  @ApiResponse({ status: 429, description: "Too many password reset requests." })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: "Password reset successfully. All active sessions revoked." })
  @ApiResponse({ status: 400, description: "Invalid or expired reset token." })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  @ApiResponse({ status: 302, description: "Redirects to Google OAuth consent screen." })
  googleAuth() {}

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Handle Google OAuth callback and issue session" })
  @ApiResponse({ status: 200, description: "OAuth successful. Returns tokens + redirectUrl." })
  @ApiResponse({ status: 401, description: "Google authentication failed." })
  googleCallback(@Req() req: Request) {
    const appUrl = this.configService.get<string>("APP_URL", "http://localhost:3001");
    return this.authService.loginWithGoogle(req.user as GoogleUser, appUrl);
  }

  @Public()
  @Post("set-session")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set session cookie from access token (OAuth bridge)" })
  @ApiResponse({ status: 200, description: "Session cookie set." })
  @ApiResponse({ status: 401, description: "Invalid access token." })
  setSession(@Body("accessToken") accessToken: string) {
    return this.authService.setSession(accessToken);
  }

  @DevOnly()
  @Post("dev/verify-user")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "[DEV] Verify user by email" })
  @ApiBody({ type: DevVerifyUserDto })
  @ApiResponse({ status: 200, description: "User verified." })
  @ApiResponse({ status: 404, description: "User not found." })
  devVerifyUser(@Body() dto: DevVerifyUserDto) {
    return this.authService.devVerifyUser(dto.email);
  }

  @DevOnly()
  @Post("dev/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "[DEV] Reset test data for user" })
  @ApiBody({ type: DevVerifyUserDto })
  @ApiResponse({ status: 200, description: "Test data reset." })
  @ApiResponse({ status: 404, description: "User not found." })
  devResetTestData(@Body() dto: DevVerifyUserDto) {
    return this.authService.devResetTestData(dto.email);
  }
}
