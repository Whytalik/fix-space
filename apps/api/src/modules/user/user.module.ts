import { Module } from "@nestjs/common";

import { JwtModule } from "@/core/jwt/jwt.module";
import { MailModule } from "@/core/mail/mail.module";
import { StorageModule } from "@/core/storage/storage.module";

import { UserController } from "./user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [JwtModule, MailModule, StorageModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
