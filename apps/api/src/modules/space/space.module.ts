import { Module } from "@nestjs/common";
import { InitializationConfigModule } from "../../core/config/initialization/initialization-config.module";
import { DatabaseModule } from "../database/database.module";
import { PropertyModule } from "../property/property.module";
import { PropertyValueModule } from "../property-value/property-value.module";
import { RecordModule } from "../record/record.module";
import { SettingsModule } from "../settings/settings.module";
import { TemplateModule } from "../template/template.module";
import { SectionRepository } from "./repositories/section.repository";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SectionService } from "./providers/section.service";
import { SpaceController } from "./space.controller";
import { SpaceRepository } from "./repositories/space.repository";
import { SpaceService } from "./space.service";

@Module({
  imports: [DatabaseModule, PropertyModule, PropertyValueModule, RecordModule, TemplateModule, InitializationConfigModule, SettingsModule],
  controllers: [SpaceController],
  providers: [SpaceService, SpaceRepository, SectionService, SectionRepository, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
  exports: [SpaceService, SpaceRepository, SectionService, SectionRepository, InitializeUserSpaceUseCase, DuplicateSpaceUseCase],
})
export class SpaceModule {}
