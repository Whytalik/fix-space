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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto, DeleteAccountDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";
import { memoryStorage } from "multer";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { UserService } from "./user.service";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved.", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getCurrentUser(@CurrentUser("userId") userId: string) {
    return this.userService.findById(userId);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "User profile updated.", type: UserResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  updateCurrentUser(@CurrentUser("userId") userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(userId, updateUserDto);
  }

  @Post("me/avatar")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("avatar", { storage: memoryStorage() }))
  @ApiOperation({ summary: "Upload or update user avatar" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        avatar: {
          type: "string",
          format: "binary",
          description: "Avatar image file (JPEG, PNG, or WebP, max 5MB)",
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Avatar uploaded successfully.", type: UserResponseDto })
  @ApiResponse({ status: 400, description: "Invalid file type or file too large." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  uploadAvatar(
    @CurrentUser("userId") userId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(userId, file);
  }

  @Delete("me/avatar")
  @ApiOperation({ summary: "Remove user avatar" })
  @ApiResponse({ status: 200, description: "Avatar removed successfully.", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  removeAvatar(@CurrentUser("userId") userId: string) {
    return this.userService.removeAvatar(userId);
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change current user password" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: "Password changed successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Current password is incorrect." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  changePassword(@CurrentUser("userId") userId: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(userId, changePasswordDto);
  }

  @Delete("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete current user account" })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({ status: 200, description: "Account deleted successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Incorrect password or unauthorized." })
  removeCurrentUser(@CurrentUser("userId") userId: string, @Body() dto: DeleteAccountDto) {
    return this.userService.remove(userId, dto);
  }
}
