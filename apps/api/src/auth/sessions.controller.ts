import { Controller, Delete, Post, Body } from '@nestjs/common';
import { LoginUserDto } from '@nucleus/domain';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';

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
