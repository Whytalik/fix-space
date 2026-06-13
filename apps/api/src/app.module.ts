import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";

import { AuthModule } from "./core/auth/auth.module";
import { RequestContextMiddleware } from "./common/context/request-context.middleware";
import { LoggerModule } from "./common/logger/logger.module";
import { validate } from "./core/config";
import { DatabaseModule } from "./modules/database/database.module";
import { HealthModule } from "./core/health/health.module";
import { E2EThrottlerGuard } from "./core/auth/guards/e2e-throttler.guard";
import { JwtAuthGuard } from "./core/jwt/jwt-auth.guard";
import { JwtModule } from "./core/jwt/jwt.module";
import { PropertyValueModule } from "./modules/property-value/property-value.module";
import { PropertyModule } from "./modules/property/property.module";
import { PropertyGroupModule } from "./modules/property-group/property-group.module";
import { RecordContentModule } from "./modules/record-content/record-content.module";
import { RecordModule } from "./modules/record/record.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { SpaceModule } from "./modules/space/space.module";
import { TemplatePropertyValueModule } from "./modules/template-property-value/template-property-value.module";
import { TemplateModule } from "./modules/template/template.module";
import { ImportExportModule } from "./modules/import-export/import-export.module";
import { IntegrationConnectionModule } from "./modules/integration-connection/integration-connection.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { UserModule } from "./modules/user/user.module";
import { ViewModule } from "./modules/view/view.module";
import { AutomationModule } from "./modules/automation/automation.module";
import { CacheModule } from "./core/cache/cache.module";
import { StatisticsModule } from "./modules/statistics/statistics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env"],
      validate,
    }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "core/i18n/"),
        watch: true,
      },
      resolvers: [new QueryResolver(["lang", "locale"]), new HeaderResolver(["x-custom-lang"]), new AcceptLanguageResolver()],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: process.env.NODE_ENV === "test" ? 10000 : 200,
      },
    ]),
    LoggerModule,
    CacheModule,
    UserModule,
    AuthModule,
    JwtModule,
    SpaceModule,
    DatabaseModule,
    ViewModule,
    HealthModule,
    PropertyModule,
    PropertyGroupModule,
    RecordModule,
    RecordContentModule,
    PropertyValueModule,
    TemplateModule,
    TemplatePropertyValueModule,
    SettingsModule,
    ImportExportModule,
    IntegrationConnectionModule,
    NotificationModule,
    AutomationModule,
    StatisticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ...(process.env.NODE_ENV === "test"
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: E2EThrottlerGuard,
          },
        ]),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
