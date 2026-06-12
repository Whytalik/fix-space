import { Module } from "@nestjs/common";
import { PropertyModule } from "@/modules/property/property.module";
import { RecordDataModule } from "@/modules/record/record-data.module";
import { PropertyValueController } from "./property-value.controller";
import { PropertyValueRepository } from "./repositories/property-value.repository";
import { PropertyValueService } from "./property-value.service";

@Module({
  imports: [PropertyModule, RecordDataModule],
  controllers: [PropertyValueController],
  providers: [PropertyValueService, PropertyValueRepository],
  exports: [PropertyValueService, PropertyValueRepository],
})
export class PropertyValueModule {}
