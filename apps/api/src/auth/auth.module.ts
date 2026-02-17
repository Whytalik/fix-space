import { forwardRef, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { InitializationConfigModule } from '../config/config.module';
import { JwtModule } from '../jwt/jwt.module';
import { MailModule } from '../mail/mail.module';
import { SpaceModule } from '../space/space.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserService } from './register-user.usecase';
import { TokenService } from './token.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule,
    MailModule,
    SpaceModule,
    InitializationConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, RegisterUserService, TokenService],
  exports: [RegisterUserService, TokenService],
})
export class AuthModule {}
