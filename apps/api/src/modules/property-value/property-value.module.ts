import { Module } from "@nestjs/common";
import { PropertyModule } from "../property/property.module";
import { PropertyValueController } from "./property-value.controller";
import { PropertyValueRepository } from "./repositories/property-value.repository";
import { PropertyValueService } from "./property-value.service";

@Module({
  imports: [PropertyModule],
  controllers: [PropertyValueController],
  providers: [PropertyValueService, PropertyValueRepository],
  exports: [PropertyValueService, PropertyValueRepository],
})
export class PropertyValueModule {}
