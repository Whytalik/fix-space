import { CanActivate, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    if (this.configService.get<string>("NODE_ENV") !== "development") {
      throw new ForbiddenException("Available in development only");
    }
    return true;
  }
}
