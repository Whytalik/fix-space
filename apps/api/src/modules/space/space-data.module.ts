import { Module } from "@nestjs/common";

import { SectionRepository } from "./repositories/section.repository";
import { SpaceRepository } from "./repositories/space.repository";

@Module({
  providers: [SpaceRepository, SectionRepository],
  exports: [SpaceRepository, SectionRepository],
})
export class SpaceDataModule {}
