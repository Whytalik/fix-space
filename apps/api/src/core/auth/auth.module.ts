import { Module } from "@nestjs/common";
import { JwtModule } from "../jwt/jwt.module";
import { MailModule } from "../mail/mail.module";
import { SpaceModule } from "../../modules/space/space.module";
import { UserModule } from "../../modules/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DevOnlyGuard } from "./guards/dev-only.guard";
import { RegisterUserUseCase } from "./providers/register-user.usecase";

@Module({
  imports: [UserModule, JwtModule, MailModule, SpaceModule],
  controllers: [AuthController],
  providers: [AuthService, RegisterUserUseCase, DevOnlyGuard],
  exports: [RegisterUserUseCase],
})
export class AuthModule {}
