import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, StorageService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
