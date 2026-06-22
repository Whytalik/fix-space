import { Injectable } from "@nestjs/common";
import { InitializationConfig, defaultInitializationConfig } from "./initialization.config";

@Injectable()
export class InitializationConfigService {
  private readonly config: InitializationConfig = defaultInitializationConfig;

  getConfig(): InitializationConfig {
    return this.config;
  }
}
