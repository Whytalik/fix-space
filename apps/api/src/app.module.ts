import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";

import { AuthModule } from "./auth/auth.module";
import { RequestContextMiddleware } from "./common/context/request-context.middleware";
import { LoggerModule } from "./common/logger/logger.module";
import { validate } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";
import { JwtModule } from "./jwt/jwt.module";
import { PropertyValueModule } from "./property-value/property-value.module";
import { PropertyModule } from "./property/property.module";
import { RecordModule } from "./record/record.module";
import { SettingsModule } from "./settings/settings.module";
import { SpaceModule } from "./space/space.module";
import { TemplatePropertyValueModule } from "./template-property-value/template-property-value.module";
import { TemplateModule } from "./template/template.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`../../.env.${process.env.NODE_ENV ?? "development"}`, "../../.env"],
      validate,
    }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "i18n/"),
        watch: true,
      },
      resolvers: [
        new QueryResolver(["lang", "locale"]),
        new HeaderResolver(["x-custom-lang", "accept-language"]),
        new AcceptLanguageResolver(),
      ],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
    LoggerModule,
    UserModule,
    AuthModule,
    JwtModule,
    SpaceModule,
    DatabaseModule,
    PropertyModule,
    RecordModule,
    PropertyValueModule,
    TemplateModule,
    TemplatePropertyValueModule,
    SettingsModule,
  ],
  providers: [
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
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
