import { Module } from "@nestjs/common";
import { InitializationConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { SettingsModule } from "../settings/settings.module";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SectionService } from "./providers/section.service";
import { SpaceController } from "./space.controller";
import { SpaceService } from "./space.service";

@Module({
  imports: [DatabaseModule, InitializationConfigModule, SettingsModule],
  controllers: [SpaceController],
  providers: [SpaceService, SectionService, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
  exports: [SpaceService, SectionService, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
})
export class SpaceModule {}
