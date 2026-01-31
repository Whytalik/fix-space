import { forwardRef, Module } from '@nestjs/common';
import { InitializationConfigModule } from '../config/config.module';
import { JwtModule } from '../jwt/jwt.module';
import { SectionModule } from '../section/section.module';
import { SpaceModule } from '../space/space.module';
import { UserModule } from '../user/user.module';
import { SessionsController } from './sessions.controller';
import { AuthService } from './auth.service';
import { RegisterUserService } from './register-user.usecase';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule,
    SpaceModule,
    SectionModule,
    InitializationConfigModule,
  ],
  controllers: [SessionsController],
  providers: [AuthService, RegisterUserService],
  exports: [RegisterUserService],
})
export class AuthModule {}
