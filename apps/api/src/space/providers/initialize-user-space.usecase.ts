import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../common/logger/app-logger.service';
import { InitializationConfigService } from '../../config/initialization-config.service';
import { DatabaseService } from '../../database/database.service';
import { SectionService } from './section.service';
import { SpaceService } from '../space.service';

@Injectable()
export class InitializeUserSpaceUseCase {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly configService: InitializationConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(InitializeUserSpaceUseCase.name);
  }

  async initialize(userId: string, username: string) {
    this.logger.log('Initializing user space', { userId, username });

    const config = this.configService.getConfig();
    const spaceName = this.configService.interpolateSpaceName(username);

    const space = await this.spaceService.create(userId, {
      name: spaceName,
    });

    const sortedSections = [...config.sections].sort(
      (a, b) => a.position - b.position,
    );

    for (const sectionDef of sortedSections) {
      await this.sectionService.create(space.id, {
        name: sectionDef.name,
        position: sectionDef.position,
      });
    }

    for (const databaseDef of config.databases) {
      await this.databaseService.create(space.id, {
        name: databaseDef.name,
        title: databaseDef.title,
        type: databaseDef.type,
      });
    }

    this.logger.log('User space initialized', {
      userId,
      spaceId: space.id,
      sections: sortedSections.length,
      databases: config.databases.length,
    });

    return space;
  }
}
