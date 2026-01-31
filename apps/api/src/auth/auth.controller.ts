import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@nucleus/domain';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterUserService } from './register-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerUserService: RegisterUserService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserService.register(registerUserDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  logout() {
    return { message: 'Logged out successfully' };
  }
}
