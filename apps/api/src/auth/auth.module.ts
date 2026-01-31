import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SpaceModule } from '../space/space.module';
import { SectionModule } from '../section/section.module';
import { InitializationConfigModule } from '../config/config.module';
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
