import { Module } from '@nestjs/common';
import { SystemUserProvider } from './system-user.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SystemUserProvider],
  exports: [UserService],
})
export class UserModule {}
