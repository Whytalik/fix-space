import { Module } from '@nestjs/common';
import { InitializationConfigModule } from '../config/config.module';
import { JwtModule } from '../jwt/jwt.module';
import { SectionModule } from '../section/section.module';
import { SpaceModule } from '../space/space.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserService } from './register-user.usecase';

@Module({
  imports: [
    UserModule,
    JwtModule,
    SpaceModule,
    SectionModule,
    InitializationConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RegisterUserService],
})
export class AuthModule {}
