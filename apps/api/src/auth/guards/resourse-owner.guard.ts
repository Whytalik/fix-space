import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { prisma } from "@nucleus/database";
import { REQUIRE_OWNERSHIP_KEY, RequireOwnershipOptions } from "../decorators/required-ownership.decoractor";

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

    const model = (prisma as any)[meta.model];
    if (!model) {
      throw new Error(`Prisma model "${meta.model}" not found`);
    }

    const entity = await model.findUnique({
      where: { id: resourceId },
      select: { [ownerField]: true },
    });

    if (!entity) {
      throw new NotFoundException(`${meta.model} not found`);
    }

    if (entity[ownerField] !== user.userId) {
      throw new ForbiddenException("You do not own this resource");
    }

    return true;
  }
}
