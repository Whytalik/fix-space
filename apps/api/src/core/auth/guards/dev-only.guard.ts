import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DevOnlyGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isE2EHeader = request.headers["x-e2e-test"] === "true";
    const env = this.configService.get<string>("NODE_ENV");

    if (isE2EHeader) {
      return true;
    }

    if (env !== "development" && env !== "test") {
      this.logger.error(`Forbidden access to dev-only route. Env: ${env}`);
      throw new ForbiddenException(t("errors.DEV_ONLY"));
    }
    return true;
  }
}
