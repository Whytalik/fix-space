import { Module } from "@nestjs/common";
import { PropertyModule } from "../property/property.module";
import { TemplatePropertyValueController } from "./template-property-value.controller";
import { TemplatePropertyValueRepository } from "./repositories/template-property-value.repository";
import { TemplatePropertyValueService } from "./template-property-value.service";

@Module({
  imports: [PropertyModule],
  controllers: [TemplatePropertyValueController],
  providers: [TemplatePropertyValueService, TemplatePropertyValueRepository],
  exports: [TemplatePropertyValueService, TemplatePropertyValueRepository],
})
export class TemplatePropertyValueModule {}
