import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { prisma } from "@fixspace/database";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { t } from "../../../common/utils/i18n.helper";
import {
  PRISMA_MODEL_NAMES,
  PrismaModelKey,
  REQUIRE_OWNERSHIP_KEY,
  RequireOwnershipOptions,
} from "../decorators/required-ownership.decorator";

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ResourceOwnerGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();

    const meta = this.reflector.get<RequireOwnershipOptions>(REQUIRE_OWNERSHIP_KEY, handler);

    if (!meta) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      this.logger.warn("Unauthenticated request rejected");
      throw new ForbiddenException(t("errors.USER_NOT_AUTHENTICATED"));
    }

    const paramName = meta.param ?? "id";
    const resourceId = request.params[paramName];

    if (!resourceId) {
      throw new ForbiddenException(`Missing route param: ${paramName}`);
    }

    if (!PRISMA_MODEL_NAMES.has(meta.model)) {
      throw new Error(`Prisma model "${meta.model}" is not a known model name`);
    }
    type ModelDelegate = { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    const model = (prisma as unknown as Record<PrismaModelKey, ModelDelegate>)[meta.model];

    const ownerPath = meta.ownerPath ?? [meta.ownerField ?? "ownerId"];
    const select = this.buildSelect(ownerPath);

    const entity = await model.findUnique({
      where: { id: resourceId },
      select,
    });

    if (!entity) {
      this.logger.warn("Ownership check failed: resource not found", { model: meta.model, resourceId });
      throw new NotFoundException(t("errors.NOT_FOUND"));
    }

    const ownerValue = this.navigatePath(entity, ownerPath);

    if (ownerValue !== user.userId) {
      this.logger.warn("Ownership check failed: requester is not the owner", {
        model: meta.model,
        resourceId,
        userId: user.userId,
      });
      throw new ForbiddenException(t("errors.NOT_RESOURCE_OWNER"));
    }

    return true;
  }

  private buildSelect(path: string[]): Record<string, unknown> {
    const key = path[0] as string;
    if (path.length === 1) {
      return { [key]: true };
    }
    return { [key]: { select: this.buildSelect(path.slice(1)) } };
  }

  private navigatePath(entity: Record<string, unknown>, path: string[]): unknown {
    let current: unknown = entity;
    for (const key of path) {
      if (current === null || current === undefined || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[key];
    }
    return current;
  }
}
