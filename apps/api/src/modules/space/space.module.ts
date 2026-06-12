import { Module } from "@nestjs/common";
import { InitializationConfigModule } from "@/core/config/initialization/initialization-config.module";
import { DatabaseModule } from "@/modules/database/database.module";
import { PropertyModule } from "@/modules/property/property.module";
import { PropertyValueModule } from "@/modules/property-value/property-value.module";
import { RecordModule } from "@/modules/record/record.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { TemplateModule } from "@/modules/template/template.module";
import { ViewModule } from "@/modules/view/view.module";
import { DuplicateSectionUseCase } from "./providers/duplicate-section.usecase";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { GetDashboardUseCase } from "./providers/get-dashboard.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SectionService } from "./providers/section.service";
import { SpaceController } from "./space.controller";
import { SpaceDataModule } from "./space-data.module";
import { SpaceService } from "./space.service";

@Module({
  imports: [
    DatabaseModule,
    PropertyModule,
    PropertyValueModule,
    RecordModule,
    TemplateModule,
    InitializationConfigModule,
    SettingsModule,
    ViewModule,
    SpaceDataModule,
  ],
  controllers: [SpaceController],
  providers: [
    SpaceService,
    SectionService,
    InitializeUserSpaceUseCase,
    DuplicateSpaceUseCase,
    DuplicateSectionUseCase,
    GetDashboardUseCase,
  ],
  exports: [
    SpaceService,
    SpaceDataModule,
    SectionService,
    InitializeUserSpaceUseCase,
    DuplicateSpaceUseCase,
    DuplicateSectionUseCase,
    GetDashboardUseCase,
  ],
})
export class SpaceModule {}
