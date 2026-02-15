import { Body, Controller, Delete, Post } from '@nestjs/common';
import { LoginUserDto } from '@nucleus/domain';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  create(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Delete('current')
  destroy() {
    return { message: 'Logged out successfully' };
  }
}
