import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { InitializationConfigService } from "./initialization-config.service";

@Module({
  imports: [NestConfigModule],
  providers: [InitializationConfigService],
  exports: [InitializationConfigService],
})
export class InitializationConfigModule {}
