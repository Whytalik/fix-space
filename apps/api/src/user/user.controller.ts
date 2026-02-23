import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { UpdateUserDto } from '@nucleus/domain';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

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
}
