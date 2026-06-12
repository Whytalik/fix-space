import { Module } from "@nestjs/common";

import { PropertyRepository } from "./repositories/property.repository";

@Module({
  providers: [PropertyRepository],
  exports: [PropertyRepository],
})
export class PropertyDataModule {}
