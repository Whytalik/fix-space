import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { prisma } from "@fixspace/database";
import { TemplatePropertyValueRepository } from "../template-property-value.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    templatePropertyValue: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("TemplatePropertyValueRepository", () => {
  let repository: TemplatePropertyValueRepository;

  beforeEach(() => {
    repository = new TemplatePropertyValueRepository();
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("TC-TMPL-U-037: should call prisma.findUnique", async () => {
      (prisma.templatePropertyValue.findUnique as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findById("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.templatePropertyValue.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { property: true },
      });
    });
  });

  describe("findAllByTemplate", () => {
    it("TC-TMPL-U-038: should call prisma.findMany", async () => {
      (prisma.templatePropertyValue.findMany as jest.Mock<any>).mockResolvedValue([{ id: "1" }]);
      const res = await repository.findAllByTemplate("tpl-1", "user-1");
      expect(res).toEqual([{ id: "1" }]);
      expect(prisma.templatePropertyValue.findMany).toHaveBeenCalledWith({
        where: { templateId: "tpl-1", template: { database: { space: { ownerId: "user-1" } } } },
        include: { property: true },
      });
    });
  });

  describe("upsert", () => {
    it("TC-TMPL-U-039: should call prisma.upsert", async () => {
      (prisma.templatePropertyValue.upsert as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.upsert("tpl-1", "prop-1", "val");
      expect(res).toEqual({ id: "1" });
      expect(prisma.templatePropertyValue.upsert).toHaveBeenCalledWith({
        where: { templateId_propertyId: { templateId: "tpl-1", propertyId: "prop-1" } },
        update: { value: "val" },
        create: { templateId: "tpl-1", propertyId: "prop-1", value: "val" },
      });
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-040: should call prisma.update", async () => {
      (prisma.templatePropertyValue.update as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.update("1", { value: "val" });
      expect(res).toEqual({ id: "1" });
      expect(prisma.templatePropertyValue.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { value: "val" },
      });
    });
  });

  describe("delete", () => {
    it("TC-TMPL-U-041: should call prisma.delete", async () => {
      (prisma.templatePropertyValue.delete as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.delete("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.templatePropertyValue.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });
});
