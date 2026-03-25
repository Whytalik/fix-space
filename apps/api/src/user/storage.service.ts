import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import { AppLogger } from "../common/logger/app-logger.service";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class StorageService implements OnModuleInit {
  private avatarsDir!: string;

  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(StorageService.name);
  }

  async onModuleInit(): Promise<void> {
    this.avatarsDir = path.join(process.cwd(), "public", "avatars");
    try {
      await fs.mkdir(this.avatarsDir, { recursive: true });
      this.logger.log("Avatars directory ready", { path: this.avatarsDir });
    } catch (err) {
      this.logger.error("Failed to create avatars directory", { path: this.avatarsDir, err });
      throw err;
    }
  }

  async saveAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    this.logger.debug("Saving avatar", { userId, mimetype: file.mimetype, size: file.size });

    const ext = ALLOWED_MIME_TYPES[file.mimetype];
    if (!ext) {
      throw new BadRequestException("Invalid file type. Allowed: JPEG, PNG, WebP.");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException("File too large. Maximum size is 5 MB.");
    }

    await this.removeAvatarFiles(userId);

    const filename = `${userId}.${ext}`;
    await fs.writeFile(path.join(this.avatarsDir, filename), Buffer.from(file.buffer));

    this.logger.log("Avatar saved", { userId, filename });
    return `/avatars/${filename}`;
  }

  async removeAvatarFiles(userId: string): Promise<void> {
    this.logger.debug("Removing avatar files", { userId });
    for (const ext of Object.values(ALLOWED_MIME_TYPES)) {
      const filepath = path.join(this.avatarsDir, `${userId}.${ext}`);
      await fs.unlink(filepath).catch(() => undefined);
    }
  }
}
