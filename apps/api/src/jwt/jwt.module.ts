import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }

        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>(
              'JWT_ACCESS_EXPIRATION',
              '15m',
            ) as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy],
  exports: [NestJwtModule, JwtStrategy],
})
export class JwtModule {}
