import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InitializationConfig, defaultInitializationConfig } from './initialization.config';

@Injectable()
export class InitializationConfigService {
  private config: InitializationConfig;

  constructor(private configService: ConfigService) {
    const spaceNameTemplate = this.configService.get<string>(
      'SPACE_NAME_TEMPLATE',
      defaultInitializationConfig.spaceNameTemplate,
    );

    this.config = {
      ...defaultInitializationConfig,
      spaceNameTemplate,
    };
  }

  getConfig(): InitializationConfig {
    return this.config;
  }

  interpolateSpaceName(username: string): string {
    return this.config.spaceNameTemplate.replace('{{username}}', username);
  }
}
