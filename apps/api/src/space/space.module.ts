import { Module } from '@nestjs/common';
import { InitializationConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { SectionModule } from '../section/section.module';
import { InitializeUserSpaceUseCase } from './initialize-user-space.usecase';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  imports: [SectionModule, DatabaseModule, InitializationConfigModule],
  controllers: [SpaceController],
  providers: [SpaceService, InitializeUserSpaceUseCase],
  exports: [SpaceService, InitializeUserSpaceUseCase],
})
export class SpaceModule {}
