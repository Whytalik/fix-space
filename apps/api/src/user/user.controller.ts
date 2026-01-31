import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { RegisterUserDto, UpdateUserDto } from '@nucleus/domain';
import { RegisterUserService } from '../auth/register-user.usecase';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  getCurrentUser(@CurrentUser('userId') userId: string) {
    return this.userService.findById(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch('me')
  updateCurrentUser(
    @CurrentUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('me')
  removeCurrentUser(@CurrentUser('userId') userId: string) {
    return this.userService.remove(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
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
