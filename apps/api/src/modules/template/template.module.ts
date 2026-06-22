import { Module } from "@nestjs/common";

import { StorageModule } from "@/core/storage/storage.module";
import { DatabaseDataModule } from "@/modules/database/database-data.module";
import { PropertyDataModule } from "@/modules/property/property-data.module";

import { DuplicateTemplateUseCase } from "./providers/duplicate-template.usecase";
import { TemplateController } from "./template.controller";
import { TemplateDataModule } from "./template-data.module";
import { TemplateService } from "./template.service";

@Module({
  imports: [StorageModule, DatabaseDataModule, PropertyDataModule, TemplateDataModule],
  controllers: [TemplateController],
  providers: [TemplateService, DuplicateTemplateUseCase],
  exports: [TemplateService, TemplateDataModule, DuplicateTemplateUseCase],
})
export class TemplateModule {}
