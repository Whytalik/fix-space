import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ChangePasswordDto, UpdateUserDto } from "@nucleus/domain";
import { memoryStorage } from "multer";
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

  @Post("me/avatar")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("avatar", { storage: memoryStorage() }))
  uploadAvatar(
    @CurrentUser("userId")
    userId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(userId, file);
  }

  @Delete("me/avatar")
  removeAvatar(
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.userService.removeAvatar(userId);
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
