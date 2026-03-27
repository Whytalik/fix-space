import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { StorageService } from "../storage.service";

// Mock fs/promises so no real filesystem access occurs during tests.
const mockMkdir = jest.fn<any>();
const mockWriteFile = jest.fn<any>();
const mockUnlink = jest.fn<any>();

jest.mock("fs/promises", () => ({
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
}));

// Mock path so every join returns a predictable string we can assert on.
jest.mock("path", () => ({
  join: (...segments: string[]) => segments.join("/"),
}));

describe("StorageService", () => {
  let service: StorageService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const makeFile = (mimetype: string, sizeBytes: number): Express.Multer.File =>
    ({
      mimetype,
      size: sizeBytes,
      buffer: Buffer.from("fake-image-data"),
      fieldname: "avatar",
      originalname: "avatar.jpg",
      encoding: "7bit",
      destination: "",
      filename: "",
      path: "",
      stream: null as any,
    }) as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe("onModuleInit", () => {
    it("should create the avatars directory and log success", async () => {
      mockMkdir.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockMkdir).toHaveBeenCalledTimes(1);
      expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining("avatars"), { recursive: true });
      expect(mockLogger.log).toHaveBeenCalledWith("Avatars directory ready", expect.any(Object));
    });

    it("should rethrow when mkdir fails", async () => {
      const err = new Error("EACCES: permission denied");
      mockMkdir.mockRejectedValue(err);

      await expect(service.onModuleInit()).rejects.toThrow("EACCES: permission denied");
      expect(mockLogger.error).toHaveBeenCalledWith("Failed to create avatars directory", expect.any(Object));
    });
  });

  describe("saveAvatar", () => {
    beforeEach(async () => {
      // Initialise the service so avatarsDir is set.
      mockMkdir.mockResolvedValue(undefined);
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it("should write the file and return the public URL for a valid JPEG", async () => {
      const file = makeFile("image/jpeg", 1024);
      mockUnlink.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.saveAvatar("user-123", file);

      expect(result).toBe("/avatars/user-123.jpg");
      expect(mockWriteFile).toHaveBeenCalledWith(expect.stringContaining("user-123.jpg"), file.buffer);
    });

    it("should write the file and return the public URL for a valid PNG", async () => {
      const file = makeFile("image/png", 512);
      mockUnlink.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.saveAvatar("user-456", file);

      expect(result).toBe("/avatars/user-456.png");
    });

    it("should write the file and return the public URL for a valid WebP", async () => {
      const file = makeFile("image/webp", 512);
      mockUnlink.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.saveAvatar("user-789", file);

      expect(result).toBe("/avatars/user-789.webp");
    });

    it("should remove existing avatar files before writing the new one", async () => {
      const file = makeFile("image/jpeg", 1024);
      mockUnlink.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await service.saveAvatar("user-123", file);

      // removeAvatarFiles iterates jpg, png, webp — 3 unlink calls before writeFile.
      expect(mockUnlink).toHaveBeenCalledTimes(3);
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    it("should throw BadRequestException for an unsupported MIME type", async () => {
      const file = makeFile("image/gif", 1024);

      await expect(service.saveAvatar("user-123", file)).rejects.toThrow(BadRequestException);
      await expect(service.saveAvatar("user-123", file)).rejects.toThrow(
        "Invalid file type. Allowed: JPEG, PNG, WebP.",
      );
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when the file exceeds 5 MB", async () => {
      const fiveMbPlusOne = 5 * 1024 * 1024 + 1;
      const file = makeFile("image/jpeg", fiveMbPlusOne);

      await expect(service.saveAvatar("user-123", file)).rejects.toThrow(BadRequestException);
      await expect(service.saveAvatar("user-123", file)).rejects.toThrow("File too large. Maximum size is 5 MB.");
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should accept a file that is exactly 5 MB", async () => {
      const exactlyFiveMb = 5 * 1024 * 1024;
      const file = makeFile("image/jpeg", exactlyFiveMb);
      mockUnlink.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await expect(service.saveAvatar("user-123", file)).resolves.toBe("/avatars/user-123.jpg");
    });
  });

  describe("removeAvatarFiles", () => {
    beforeEach(async () => {
      mockMkdir.mockResolvedValue(undefined);
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it("should call unlink for every allowed extension", async () => {
      mockUnlink.mockResolvedValue(undefined);

      await service.removeAvatarFiles("user-123");

      expect(mockUnlink).toHaveBeenCalledTimes(3);
      expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining("user-123.jpg"));
      expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining("user-123.png"));
      expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining("user-123.webp"));
    });

    it("should swallow ENOENT errors and not throw when a file does not exist", async () => {
      mockUnlink.mockRejectedValue(new Error("ENOENT: no such file or directory"));

      await expect(service.removeAvatarFiles("user-123")).resolves.toBeUndefined();
    });

    it("should swallow all unlink errors without propagating them", async () => {
      mockUnlink.mockRejectedValue(new Error("unexpected error"));

      await expect(service.removeAvatarFiles("user-123")).resolves.toBeUndefined();
    });
  });
});
