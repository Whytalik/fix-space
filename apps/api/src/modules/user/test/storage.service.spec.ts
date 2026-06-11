import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { StorageService } from "@/core/storage/storage.service";

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe("StorageService — TC-SET-U-001", () => {
  let service: StorageService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
  });

  it("should throw BadRequestException for unsupported MIME type (SVG)", async () => {
    const file = { mimetype: "image/svg+xml", size: 1024, buffer: Buffer.from("") } as Express.Multer.File;

    await expect(service.saveAvatar("user-1", file)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when file exceeds 5 MB", async () => {
    const file = { mimetype: "image/png", size: 6 * 1024 * 1024, buffer: Buffer.from("") } as Express.Multer.File;

    await expect(service.saveAvatar("user-1", file)).rejects.toThrow(BadRequestException);
  });

  it("should upload valid PNG and return secure_url", async () => {
    const { v2: cloudinary } = await import("cloudinary");
    const mockSecureUrl = "https://res.cloudinary.com/test/image/upload/fixspace/avatars/user-1.jpg";

    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_opts: unknown, callback: (error: null, res: { secure_url: string }) => void) => {
        const stream = {
          end: () => callback(null, { secure_url: mockSecureUrl }),
        };
        return stream;
      },
    );

    const file = { mimetype: "image/png", size: 2 * 1024 * 1024, buffer: Buffer.from("data") } as Express.Multer.File;

    const result = await service.saveAvatar("user-1", file);

    expect(result).toBe(mockSecureUrl);
  });
});
