import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateUserDto } from '@nucleus/domain';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
