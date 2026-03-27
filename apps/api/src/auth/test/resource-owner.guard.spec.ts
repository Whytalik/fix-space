import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ExecutionContext} from "@nestjs/common";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    space: {
      findUnique: jest.fn<any>(),
    },
    record: {
      findUnique: jest.fn<any>(),
    },
    database: {
      findUnique: jest.fn<any>(),
    },
  },
}));

import { prisma } from "@nucleus/database";
import { ResourceOwnerGuard } from "../guards/resource-owner.guard";

const mockReflector = {
  get: jest.fn<any>(),
};

function makeContext(overrides: { meta?: unknown; user?: unknown; params?: Record<string, string> }): ExecutionContext {
  const request = {
    user: overrides.user,
    params: overrides.params ?? {},
  };
  return {
    getHandler: jest.fn<any>().mockReturnValue({}),
    switchToHttp: jest.fn<any>().mockReturnValue({
      getRequest: jest.fn<any>().mockReturnValue(request),
    }),
  } as unknown as ExecutionContext;
}

describe("ResourceOwnerGuard", () => {
  let guard: ResourceOwnerGuard;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceOwnerGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<ResourceOwnerGuard>(ResourceOwnerGuard);
  });

  describe("canActivate", () => {
    it("should return true when no @RequireOwnership metadata is set", async () => {
      mockReflector.get.mockReturnValue(undefined);
      const ctx = makeContext({});

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
    });

    it("should throw ForbiddenException when user is not on request", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id" });
      const ctx = makeContext({ user: undefined, params: { id: "some-id" } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(ctx)).rejects.toThrow("User not authenticated");
    });

    it("should throw ForbiddenException when route param is missing", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: {} });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(ctx)).rejects.toThrow("Missing route param: id");
    });

    it("should throw Error when Prisma model name is not known", async () => {
      mockReflector.get.mockReturnValue({ model: "unknownModel", param: "id" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "res-1" } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(Error);
      await expect(guard.canActivate(ctx)).rejects.toThrow(/not a known model name/);
    });

    it("should throw NotFoundException when entity does not exist in DB", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(null);
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "space-1" } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when entity ownerId does not match user", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({ ownerId: "other-user" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "space-1" } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(ctx)).rejects.toThrow("You do not own this resource");
    });

    it("should return true when entity ownerId matches user", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({ ownerId: "user-1" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "space-1" } });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
    });

    it("should use custom ownerField when specified in metadata", async () => {
      mockReflector.get.mockReturnValue({ model: "record", param: "id", ownerField: "createdById" });
      (prisma.record.findUnique as jest.Mock<any>).mockResolvedValue({ createdById: "user-1" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "rec-1" } });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
    });

    it("should throw Error when ownerField does not exist on entity", async () => {
      mockReflector.get.mockReturnValue({ model: "space", param: "id", ownerField: "nonExistentField" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({ ownerId: "user-1" });
      const ctx = makeContext({ user: { userId: "user-1" }, params: { id: "space-1" } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(Error);
      await expect(guard.canActivate(ctx)).rejects.toThrow(/does not exist on/);
    });
  });
});
