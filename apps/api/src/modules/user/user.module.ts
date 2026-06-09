import { Module } from "@nestjs/common";
import { JwtModule } from "@/core/jwt/jwt.module";
import { MailModule } from "@/core/mail/mail.module";
import { StorageService } from "./providers/storage.service";
import { UserController } from "./user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [JwtModule, MailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, StorageService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
