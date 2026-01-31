import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { CreateSpaceUseCase } from './create-space.usecase';
import { InitializeUserSpaceUseCase } from './initialize-user-space.usecase';
import { SectionModule } from '../section/section.module';
import { InitializationConfigModule } from '../config/config.module';

@Module({
  imports: [SectionModule, InitializationConfigModule],
  controllers: [SpaceController],
  providers: [SpaceService, CreateSpaceUseCase, InitializeUserSpaceUseCase],
  exports: [CreateSpaceUseCase, InitializeUserSpaceUseCase],
})
export class SpaceModule {}
