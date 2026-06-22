import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { prisma } from "@fixspace/database";
import { UserRepository } from "../user.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("TC-AUTH-U-044: should call prisma.findUnique with email", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findByEmail("test@example.com");
      expect(res).toEqual({ id: "1" });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        select: { id: true, email: true, username: true, icon: true, isVerified: true, createdAt: true },
      });
    });
  });

  describe("findByIdOrThrow", () => {
    it("TC-AUTH-U-045: should call prisma.findUniqueOrThrow with id", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.findByIdOrThrow("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("update", () => {
    it("TC-AUTH-U-046: should call prisma.update", async () => {
      const data = { username: "newname" } as any;
      (prisma.user.update as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.update("1", data);
      expect(res).toEqual({ id: "1" });
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: "1" }, data });
    });
  });

  describe("delete", () => {
    it("TC-AUTH-U-047: should call prisma.delete", async () => {
      (prisma.user.delete as jest.Mock<any>).mockResolvedValue({ id: "1" });
      const res = await repository.delete("1");
      expect(res).toEqual({ id: "1" });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });
});
