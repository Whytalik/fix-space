import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AppLogger } from "../../../common/logger/app-logger.service";
import { ResourceOwnerGuard } from "../guards/resource-owner.guard";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    ModelName: {
      Space: "Space",
      Database: "Database",
      Record: "Record",
      Property: "Property",
      PropertyValue: "PropertyValue",
    },
  },
  prisma: {
    space: { findUnique: jest.fn() },
    database: { findUnique: jest.fn() },
    record: { findUnique: jest.fn() },
    property: { findUnique: jest.fn() },
    propertyValue: { findUnique: jest.fn() },
  },
}));

import { prisma } from "@fixspace/database";

function createMockContext(params: Record<string, string>, user?: { userId: string; username: string }) {
  const request: Record<string, unknown> = { params, user };
  return {
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    _request: request,
  };
}

describe("ResourceOwnerGuard", () => {
  let guard: ResourceOwnerGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    const mockLogger = {
      setContext: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLogger;
    guard = new ResourceOwnerGuard(reflector, mockLogger);
    jest.clearAllMocks();
  });

  it("returns true when no metadata is set", async () => {
    jest.spyOn(reflector, "get").mockReturnValue(undefined);
    const ctx = createMockContext({ id: "123" }, { userId: "u1", username: "test" });

    const result = await guard.canActivate(ctx as never);

    expect(result).toBe(true);
  });

  it("throws ForbiddenException when user is not authenticated", async () => {
    jest.spyOn(reflector, "get").mockReturnValue({
      model: "space",
      ownerPath: ["ownerId"],
    });
    const ctx = createMockContext({ id: "123" });

    await expect(guard.canActivate(ctx as never)).rejects.toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when route param is missing", async () => {
    jest.spyOn(reflector, "get").mockReturnValue({
      model: "space",
      ownerPath: ["ownerId"],
    });
    const ctx = createMockContext({}, { userId: "u1", username: "test" });

    await expect(guard.canActivate(ctx as never)).rejects.toThrow(ForbiddenException);
  });

  it("throws NotFoundException when entity is not found", async () => {
    jest.spyOn(reflector, "get").mockReturnValue({
      model: "space",
      ownerPath: ["ownerId"],
    });
    (prisma.space.findUnique as unknown as jest.Mock<any>).mockResolvedValue(null);
    const ctx = createMockContext({ id: "space-1" }, { userId: "u1", username: "test" });

    await expect(guard.canActivate(ctx as never)).rejects.toThrow(NotFoundException);
  });

  describe("direct ownerPath (Space)", () => {
    it("allows access when user owns the resource", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "space",
        ownerPath: ["ownerId"],
      });
      (prisma.space.findUnique as unknown as jest.Mock<any>).mockResolvedValue({ ownerId: "u1" });
      const ctx = createMockContext({ id: "space-1" }, { userId: "u1", username: "test" });

      const result = await guard.canActivate(ctx as never);

      expect(result).toBe(true);
      expect(prisma.space.findUnique).toHaveBeenCalledWith({
        where: { id: "space-1" },
        select: { ownerId: true },
      });
    });

    it("throws ForbiddenException when user does not own the resource", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "space",
        ownerPath: ["ownerId"],
      });
      (prisma.space.findUnique as unknown as jest.Mock<any>).mockResolvedValue({ ownerId: "other-user" });
      const ctx = createMockContext({ id: "space-1" }, { userId: "u1", username: "test" });

      await expect(guard.canActivate(ctx as never)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("nested ownerPath (Database → Space)", () => {
    it("allows access when user owns the parent space", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "database",
        ownerPath: ["space", "ownerId"],
      });
      (prisma.database.findUnique as unknown as jest.Mock<any>).mockResolvedValue({
        space: { ownerId: "u1" },
      });
      const ctx = createMockContext({ id: "db-1" }, { userId: "u1", username: "test" });

      const result = await guard.canActivate(ctx as never);

      expect(result).toBe(true);
      expect(prisma.database.findUnique).toHaveBeenCalledWith({
        where: { id: "db-1" },
        select: { space: { select: { ownerId: true } } },
      });
    });

    it("throws ForbiddenException when user does not own the parent space", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "database",
        ownerPath: ["space", "ownerId"],
      });
      (prisma.database.findUnique as unknown as jest.Mock<any>).mockResolvedValue({
        space: { ownerId: "other-user" },
      });
      const ctx = createMockContext({ id: "db-1" }, { userId: "u1", username: "test" });

      await expect(guard.canActivate(ctx as never)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("deeply nested ownerPath (Record → Database → Space)", () => {
    it("allows access when user owns the grandparent space", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "record",
        ownerPath: ["database", "space", "ownerId"],
      });
      (prisma.record.findUnique as unknown as jest.Mock<any>).mockResolvedValue({
        database: { space: { ownerId: "u1" } },
      });
      const ctx = createMockContext({ id: "rec-1" }, { userId: "u1", username: "test" });

      const result = await guard.canActivate(ctx as never);

      expect(result).toBe(true);
      expect(prisma.record.findUnique).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        select: { database: { select: { space: { select: { ownerId: true } } } } },
      });
    });

    it("throws ForbiddenException when user does not own the grandparent space", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "record",
        ownerPath: ["database", "space", "ownerId"],
      });
      (prisma.record.findUnique as unknown as jest.Mock<any>).mockResolvedValue({
        database: { space: { ownerId: "other-user" } },
      });
      const ctx = createMockContext({ id: "rec-1" }, { userId: "u1", username: "test" });

      await expect(guard.canActivate(ctx as never)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("backward compatibility with ownerField", () => {
    it("uses ownerField when ownerPath is not provided", async () => {
      jest.spyOn(reflector, "get").mockReturnValue({
        model: "space",
        ownerField: "ownerId",
      });
      (prisma.space.findUnique as unknown as jest.Mock<any>).mockResolvedValue({ ownerId: "u1" });
      const ctx = createMockContext({ id: "space-1" }, { userId: "u1", username: "test" });

      const result = await guard.canActivate(ctx as never);

      expect(result).toBe(true);
    });
  });
});
