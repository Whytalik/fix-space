import { Injectable } from '@nestjs/common';
import { InitializationConfigService } from '../config/initialization-config.service';
import { DatabaseService } from '../database/database.service';
import { SectionService } from '../section/section.service';
import { CreateSpaceUseCase } from './create-space.usecase';

@Injectable()
export class InitializeUserSpaceUseCase {
  constructor(
    private readonly createSpaceUseCase: CreateSpaceUseCase,
    private readonly sectionService: SectionService,
    private readonly databaseService: DatabaseService,
    private readonly configService: InitializationConfigService,
  ) {}

  async initialize(userId: string, username: string) {
    const config = this.configService.getConfig();
    const spaceName = this.configService.interpolateSpaceName(username);

    const space = await this.createSpaceUseCase.create({
      name: spaceName,
      ownerId: userId,
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
      });
    }

    return space;
  }
}
