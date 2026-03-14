import { Module } from "@nestjs/common";
import { PropertyModule } from "../property/property.module";
import { TemplatePropertyValueController } from "./template-property-value.controller";
import { TemplatePropertyValueService } from "./template-property-value.service";

@Module({
  imports: [PropertyModule],
  controllers: [TemplatePropertyValueController],
  providers: [TemplatePropertyValueService],
  exports: [TemplatePropertyValueService],
})
export class TemplatePropertyValueModule {}
