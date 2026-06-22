import { Module } from "@nestjs/common";
import { PropertyModule } from "@/modules/property/property.module";
import { TemplateModule } from "@/modules/template/template.module";
import { TemplatePropertyValueController } from "./template-property-value.controller";
import { TemplatePropertyValueRepository } from "./repositories/template-property-value.repository";
import { TemplatePropertyValueService } from "./template-property-value.service";

@Module({
  imports: [PropertyModule, TemplateModule],
  controllers: [TemplatePropertyValueController],
  providers: [TemplatePropertyValueService, TemplatePropertyValueRepository],
  exports: [TemplatePropertyValueService, TemplatePropertyValueRepository],
})
export class TemplatePropertyValueModule {}
