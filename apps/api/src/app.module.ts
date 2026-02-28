import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RequestContextMiddleware } from './common/context/request-context.middleware';
import { LoggerModule } from './common/logger/logger.module';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { JwtModule } from './jwt/jwt.module';
import { PropertyValueModule } from './property-value/property-value.module';
import { PropertyModule } from './property/property.module';
import { RecordContentModule } from './record-content/record-content.module';
import { RecordModule } from './record/record.module';
import { SpaceModule } from './space/space.module';
import { UserModule } from './user/user.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`../../.env.${process.env.NODE_ENV || 'development'}`, '../../.env'],
      validate,
    }),
    LoggerModule,
    UserModule,
    AuthModule,
    JwtModule,
    SpaceModule,
    DatabaseModule,
    PropertyModule,
    RecordModule,
    PropertyValueModule,
    RecordContentModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
