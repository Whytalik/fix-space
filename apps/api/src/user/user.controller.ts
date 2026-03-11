import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { ChangePasswordDto, UpdateUserDto } from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  getCurrentUser(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.userService.findById(userId);
  }

  @Patch("me")
  updateCurrentUser(
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser("userId")
    userId: string,
    @Body()
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, changePasswordDto);
  }

  @Delete("me")
  removeCurrentUser(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.userService.remove(userId);
  }
}
