import { Module } from "@nestjs/common";
import { SettingsModule } from "@/modules/settings/settings.module";
import { ViewController } from "./view.controller";
import { ViewRepository } from "./repositories/view.repository";
import { ViewService } from "./view.service";

@Module({
  imports: [SettingsModule],
  controllers: [ViewController],
  providers: [ViewService, ViewRepository],
  exports: [ViewService, ViewRepository],
})
export class ViewModule {}
