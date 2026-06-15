import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { prisma } from "@fixspace/database";
import { ViewRepository } from "../view.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    view: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("ViewRepository", () => {
  let repository: ViewRepository;

  beforeEach(() => {
    repository = new ViewRepository();
    jest.clearAllMocks();
  });

  describe("findAllByDatabase", () => {
    it("TC-VIEW-U-035: should call prisma.findMany", async () => {
      (prisma.view.findMany as jest.Mock<any>).mockResolvedValue([{ id: "1" }]);
      const res = await repository.findAllByDatabase("db-1");
      expect(res).toEqual([{ id: "1" }]);
      expect(prisma.view.findMany).toHaveBeenCalledWith({
        where: { databaseId: "db-1" },
        orderBy: { position: "asc" },
      });
    });
  });

  describe("findById", () => {
    it("TC-VIEW-U-036: should call prisma.findUnique", async () => {
      (prisma.view.findUnique as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findById("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.view.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("countByDatabase", () => {
    it("TC-VIEW-U-037: should call prisma.count", async () => {
      (prisma.view.count as jest.Mock<any>).mockResolvedValue(5);
      const res = await repository.countByDatabase("db-1");
      expect(res).toBe(5);
      expect(prisma.view.count).toHaveBeenCalledWith({ where: { databaseId: "db-1" } });
    });
  });

  describe("create", () => {
    it("TC-VIEW-U-038: should call prisma.create", async () => {
      const data = { databaseId: "db-1", name: "v1" } as any;
      (prisma.view.create as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.create(data);
      expect(res).toEqual({ id: "1" });
      expect(prisma.view.create).toHaveBeenCalledWith({ data });
    });
  });

  describe("update", () => {
    it("TC-VIEW-U-039: should call prisma.update", async () => {
      const data = { name: "v2" } as any;
      (prisma.view.update as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.update("1", data);
      expect(res).toEqual({ id: "1" });
      expect(prisma.view.update).toHaveBeenCalledWith({ where: { id: "1" }, data });
    });
  });

  describe("delete", () => {
    it("TC-VIEW-U-040: should call prisma.delete", async () => {
      (prisma.view.delete as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.delete("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.view.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });
});
