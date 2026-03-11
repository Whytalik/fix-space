import { Module } from "@nestjs/common";
import { JwtModule } from "../jwt/jwt.module";
import { MailModule } from "../mail/mail.module";
import { SpaceModule } from "../space/space.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DevOnlyGuard } from "./guards/dev-only.guard";
import { RegisterUserUseCase } from "./providers/register-user.usecase";
import { TokenService } from "./token.service";

@Module({
  imports: [UserModule, JwtModule, MailModule, SpaceModule],
  controllers: [AuthController],
  providers: [AuthService, RegisterUserUseCase, TokenService, DevOnlyGuard],
  exports: [RegisterUserUseCase, TokenService],
})
export class AuthModule {}
