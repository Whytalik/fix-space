import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { RegisterUserDto, UpdateUserDto } from '@nucleus/domain';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RegisterUserService } from '../auth/register-user.usecase';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly registerUserService: RegisterUserService,
  ) {}

  @Public()
  @Post()
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.registerUserService.register(registerUserDto);
  }

  @Get('me')
  getCurrentUser(@CurrentUser('userId') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch('me')
  updateCurrentUser(
    @CurrentUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Delete('me')
  removeCurrentUser(@CurrentUser('userId') userId: string) {
    return this.userService.remove(userId);
  }

  @Delete()
  async removeAllUsers() {
    await prisma.user.deleteMany();
    await prisma.space.deleteMany();
    await prisma.section.deleteMany();
    await prisma.database.deleteMany();
    return { message: 'All users and related data have been deleted.' };
  }
}
