import { Module } from "@nestjs/common";
import { InitializationConfigService } from "./initialization-config.service";

@Module({
  providers: [InitializationConfigService],
  exports: [InitializationConfigService],
})
export class InitializationConfigModule {}
