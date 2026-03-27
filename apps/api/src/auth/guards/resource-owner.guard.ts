import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { prisma } from "@nucleus/database";
import {
  PRISMA_MODEL_NAMES,
  PrismaModelKey,
  REQUIRE_OWNERSHIP_KEY,
  RequireOwnershipOptions,
} from "../decorators/required-ownership.decorator";

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();

    const meta = this.reflector.get<RequireOwnershipOptions>(REQUIRE_OWNERSHIP_KEY, handler);

    if (!meta) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException("User not authenticated");
    }

    const paramName = meta.param ?? "id";
    const ownerField = meta.ownerField ?? "ownerId";
    const resourceId = request.params[paramName];

    if (!resourceId) {
      throw new ForbiddenException(`Missing route param: ${paramName}`);
    }

    if (!PRISMA_MODEL_NAMES.has(meta.model)) {
      throw new Error(`Prisma model "${meta.model}" is not a known model name`);
    }
    type ModelDelegate = { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    const model = (prisma as unknown as Record<PrismaModelKey, ModelDelegate>)[meta.model];

    const entity = await model.findUnique({
      where: { id: resourceId },
      select: { [ownerField]: true },
    });

    if (!entity) {
      throw new NotFoundException(`${meta.model} not found`);
    }

    if (!(ownerField in entity)) {
      throw new Error(`Field "${ownerField}" does not exist on ${meta.model} — check @RequireOwnership config`);
    }

    if (entity[ownerField] !== user.userId) {
      throw new ForbiddenException("You do not own this resource");
    }

    return true;
  }
}
