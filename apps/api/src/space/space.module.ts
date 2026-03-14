import { Module } from "@nestjs/common";
import { InitializationConfigModule } from "../config/initialization-config.module";
import { DatabaseModule } from "../database/database.module";
import { PropertyModule } from "../property/property.module";
import { SettingsModule } from "../settings/settings.module";
import { TemplateModule } from "../template/template.module";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SectionService } from "./providers/section.service";
import { SpaceController } from "./space.controller";
import { SpaceService } from "./space.service";

@Module({
  imports: [DatabaseModule, PropertyModule, InitializationConfigModule, SettingsModule, TemplateModule],
  controllers: [SpaceController],
  providers: [SpaceService, SectionService, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
  exports: [SpaceService, SectionService, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
})
export class SpaceModule {}
