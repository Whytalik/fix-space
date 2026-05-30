import { CanActivate, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "../../../common/logger/app-logger.service";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DevOnlyGuard.name);
  }

  canActivate(): boolean {
    if (this.configService.get<string>("NODE_ENV") !== "development") {
      this.logger.error("Attempt to access dev-only route from production");
      throw new ForbiddenException("Not available in production environment");
    }
    return true;
  }
}
