import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "@/common/logger/app-logger.service";

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { StorageService } from "./storage.service";
import { v2 as cloudinary } from "cloudinary";

function makeFile(mimetype: string, size: number): Express.Multer.File {
  return {
    mimetype,
    size,
    buffer: Buffer.from("data"),
    fieldname: "file",
    originalname: "test.jpg",
    encoding: "7bit",
    stream: null as unknown as NodeJS.ReadableStream,
    destination: "",
    filename: "",
    path: "",
  };
}

describe("StorageService", () => {
  let service: StorageService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: "test-cloud",
        CLOUDINARY_API_KEY: "test-key",
        CLOUDINARY_API_SECRET: "test-secret",
      };
      return values[key] ?? "";
    }),
    get: jest.fn((key: string, defaultValue?: string) => {
      const values: Record<string, string> = {
        NODE_ENV: "test",
        CLOUDINARY_FOLDER_PREFIX: "fixspace-test",
      };
      return values[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, { provide: AppLogger, useValue: mockLogger }, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
  });

  describe("saveAvatar", () => {
    it("TC-CORE-U-010: should upload valid image and return secure_url", async () => {
      const file = makeFile("image/jpeg", 1024);
      const mockWritable = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock<any>).mockImplementation((_opts: unknown, cb: (err: null, res: unknown) => void) => {
        cb(null, { secure_url: "https://cdn.example.com/avatar.jpg", public_id: "fixspace/avatars/user-1" });
        return mockWritable;
      });

      const result = await service.saveAvatar("user-1", file);

      expect(result).toBe("https://cdn.example.com/avatar.jpg");
    });

    it("TC-CORE-U-011: should throw BadRequestException for invalid MIME type", async () => {
      const file = makeFile("image/gif", 1024);

      await expect(service.saveAvatar("user-1", file)).rejects.toThrow(BadRequestException);
    });

    it("TC-CORE-U-012: should throw BadRequestException when file exceeds 5 MB", async () => {
      const file = makeFile("image/png", 6 * 1024 * 1024);

      await expect(service.saveAvatar("user-1", file)).rejects.toThrow(BadRequestException);
    });
  });

  describe("saveContentImage — TC-CORE-U-013", () => {
    it("TC-CORE-U-013: should upload content image and return secure_url", async () => {
      const file = makeFile("image/webp", 512);
      const mockWritable = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock<any>).mockImplementation((_opts: unknown, cb: (err: null, res: unknown) => void) => {
        cb(null, { secure_url: "https://cdn.example.com/content.webp", public_id: "fixspace/content/uuid" });
        return mockWritable;
      });

      const result = await service.saveContentImage(file);

      expect(result).toBe("https://cdn.example.com/content.webp");
    });
  });

  describe("removeAvatarFiles", () => {
    it("TC-CORE-U-014: should call cloudinary.uploader.destroy with the correct public_id", async () => {
      (cloudinary.uploader.destroy as jest.Mock<any>).mockResolvedValue({ result: "ok" });

      await service.removeAvatarFiles("user-1");

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(expect.stringContaining("user-1"));
    });

    it("TC-CORE-U-015: should not throw when Cloudinary destroy fails", async () => {
      (cloudinary.uploader.destroy as jest.Mock<any>).mockRejectedValue(new Error("cloudinary error"));

      await expect(service.removeAvatarFiles("user-1")).resolves.toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
