import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { prisma } from "@fixspace/database";
import { TemplateRepository } from "../template.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    template: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("TemplateRepository", () => {
  let repository: TemplateRepository;

  beforeEach(() => {
    repository = new TemplateRepository();
    jest.clearAllMocks();
  });

  describe("findByIdWithOwner", () => {
    it("TC-TMPL-U-042: should call prisma.findFirst", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findByIdWithOwner("1", "user-1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: { id: "1", database: { space: { ownerId: "user-1" } } },
      });
    });
  });

  describe("findById", () => {
    it("TC-TMPL-U-043: should call prisma.findUnique", async () => {
      (prisma.template.findUnique as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findById("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("findByIdWithValues", () => {
    it("TC-TMPL-U-044: should call prisma.findUnique with values include", async () => {
      (prisma.template.findUnique as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findByIdWithValues("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { values: true },
      });
    });
  });

  describe("findAllByDatabase", () => {
    it("TC-TMPL-U-045: should call prisma.findMany", async () => {
      (prisma.template.findMany as jest.Mock<any>).mockResolvedValue([{ id: "1" }]);
      const res = await repository.findAllByDatabase("db-1", "user-1");
      expect(res).toEqual([{ id: "1" }]);
      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: { databaseId: "db-1", database: { space: { ownerId: "user-1" } } },
        include: { values: true },
        orderBy: { position: "asc" },
      });
    });
  });

  describe("count", () => {
    it("TC-TMPL-U-046: should call prisma.count", async () => {
      (prisma.template.count as jest.Mock<any>).mockResolvedValue(3);
      const res = await repository.count("db-1");
      expect(res).toBe(3);
      expect(prisma.template.count).toHaveBeenCalledWith({ where: { databaseId: "db-1" } });
    });
  });

  describe("findUniqueTemplateName", () => {
    it("TC-TMPL-U-047: should return name with (Copy) if name does not exist", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);
      const res = await repository.findUniqueTemplateName("tpl", "db-1");
      expect(res).toBe("tpl (Copy)");
    });

    it("TC-TMPL-U-048: should increment counter if name exists", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValueOnce({ id: "1" }).mockResolvedValueOnce(null);
      const res = await repository.findUniqueTemplateName("tpl", "db-1");
      expect(res).toBe("tpl (Copy 1)");
    });
  });

  describe("create", () => {
    it("TC-TMPL-U-049: should call prisma.create", async () => {
      const data = { databaseId: "db-1", name: "tpl" } as any;
      (prisma.template.create as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.create(data);
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.create).toHaveBeenCalledWith({ data });
    });
  });

  describe("findUniqueOrThrowWithValues", () => {
    it("TC-TMPL-U-050: should call prisma.findUniqueOrThrow", async () => {
      (prisma.template.findUniqueOrThrow as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findUniqueOrThrowWithValues("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { values: true },
      });
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-051: should call prisma.update", async () => {
      const data = { name: "updated" } as any;
      (prisma.template.update as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.update("1", data);
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.update).toHaveBeenCalledWith({ where: { id: "1" }, data, include: undefined });
    });
  });

  describe("updateMany", () => {
    it("TC-TMPL-U-052: should call prisma.updateMany", async () => {
      const where = { databaseId: "db-1" };
      const data = { isDefault: false };
      (prisma.template.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });
      const res = await repository.updateMany(where, data);
      expect(res).toEqual({ count: 1 });
      expect(prisma.template.updateMany).toHaveBeenCalledWith({ where, data });
    });
  });

  describe("findFirstInDatabase", () => {
    it("TC-TMPL-U-053: should call prisma.findFirst with asc position sorting", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findFirstInDatabase("db-1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: { databaseId: "db-1" },
        orderBy: { position: "asc" },
      });
    });
  });

  describe("findDefaultInDatabase", () => {
    it("TC-TMPL-U-054: should call prisma.findFirst with isDefault: true", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findDefaultInDatabase("db-1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: { databaseId: "db-1", isDefault: true },
      });
    });
  });

  describe("findByNameInDatabase", () => {
    it("TC-TMPL-U-055: should call prisma.findFirst with name and db", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findByNameInDatabase("db-1", "My Tpl");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: { databaseId: "db-1", name: "My Tpl" },
      });
    });
  });

  describe("delete", () => {
    it("TC-TMPL-U-056: should call prisma.delete", async () => {
      (prisma.template.delete as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.delete("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.template.delete).toHaveBeenCalledWith({ where: { id: "1" }, include: undefined });
    });
  });
});
