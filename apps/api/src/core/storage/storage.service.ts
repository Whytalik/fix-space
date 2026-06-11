import { randomUUID } from "crypto";

import { BadRequestException, Injectable } from "@nestjs/common";

import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class StorageService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(StorageService.name);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async saveAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    this.logger.debug("Uploading avatar to Cloudinary", { userId, mimetype: file.mimetype, size: file.size });

    this.validateImage(file);

    const folder = process.env.CLOUDINARY_AVATAR_FOLDER ?? "fixspace/avatars";
    const result = await this.upload(file, {
      public_id: userId,
      folder,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
    });

    this.logger.log("Avatar uploaded to Cloudinary", { userId, publicId: result.public_id });
    return result.secure_url;
  }

  async removeAvatarFiles(userId: string): Promise<void> {
    this.logger.debug("Removing avatar from Cloudinary", { userId });

    const folder = process.env.CLOUDINARY_AVATAR_FOLDER ?? "fixspace/avatars";
    const publicId = `${folder}/${userId}`;

    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log("Avatar removed from Cloudinary", { userId });
    } catch (error) {
      this.logger.warn("Failed to remove avatar from Cloudinary", { userId, error });
    }
  }

  async saveContentImage(file: Express.Multer.File): Promise<string> {
    this.logger.debug("Uploading content image to Cloudinary", { mimetype: file.mimetype, size: file.size });

    this.validateImage(file);

    const folder = process.env.CLOUDINARY_CONTENT_FOLDER ?? "fixspace/content";
    const result = await this.upload(file, { public_id: randomUUID(), folder, overwrite: false });

    this.logger.log("Content image uploaded to Cloudinary", { publicId: result.public_id });
    return result.secure_url;
  }

  private validateImage(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException(t("errors.INVALID_FILE_TYPE", { allowedTypes: "JPEG, PNG, WebP" }));
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(t("errors.FILE_TOO_LARGE", { maxSize: 5 }));
    }
  }

  private upload(file: Express.Multer.File, options: UploadApiOptions): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", ...options }, (error, response) => {
          if (error) reject(error);
          else resolve(response as UploadApiResponse);
        })
        .end(file.buffer);
    });
  }
}
