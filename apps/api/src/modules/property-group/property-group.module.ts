import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/modules/database/database.module";
import { PropertyGroupController } from "./property-group.controller";
import { PropertyGroupRepository } from "./repositories/property-group.repository";
import { PropertyGroupService } from "./property-group.service";

@Module({
  imports: [DatabaseModule],
  controllers: [PropertyGroupController],
  providers: [PropertyGroupService, PropertyGroupRepository],
  exports: [PropertyGroupService, PropertyGroupRepository],
})
export class PropertyGroupModule {}
