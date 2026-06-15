import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma } from "@fixspace/database";
import {
  ContentImageResponseDto,
  ContentSchema,
  RecordContentResponseDto,
  RecordContentSnapshotResponseDto,
  UpdateRecordContentDto,
} from "@fixspace/domain";

import { AppLogger } from "../../common/logger/app-logger.service";
import { t } from "../../common/utils/i18n.helper";

import { StorageService } from "../../core/storage/storage.service";

import { RecordContentRepository } from "./repositories/record-content.repository";

@Injectable()
export class RecordContentService {
  private readonly SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
  private readonly MAX_SNAPSHOTS = 50;

  constructor(
    private readonly logger: AppLogger,
    private readonly recordContentRepo: RecordContentRepository,
    private readonly storageService: StorageService,
  ) {
    this.logger.setContext(RecordContentService.name);
  }

  async uploadImage(recordId: string, file: Express.Multer.File): Promise<ContentImageResponseDto> {
    this.logger.debug("Uploading content image", { recordId });
    const url = await this.storageService.saveContentImage(file);
    this.logger.log("Content image uploaded", { recordId });
    return new ContentImageResponseDto({ url });
  }

  async findByRecordId(recordId: string): Promise<RecordContentResponseDto> {
    this.logger.debug("Finding record content", { recordId });

    const entity = await this.recordContentRepo.findByRecordId(recordId);
    if (!entity) {
      return new RecordContentResponseDto({
        recordId,
        content: { rows: [] },
        lastEditedAt: new Date(),
      });
    }

    return new RecordContentResponseDto({
      ...entity,
      content: entity.content as unknown as ContentSchema,
    });
  }

  async update(recordId: string, dto: UpdateRecordContentDto): Promise<RecordContentResponseDto> {
    this.logger.debug("Updating record content", { recordId });

    const result = await this.recordContentRepo.transaction(async (tx) => {
      const existing = await this.recordContentRepo.findByRecordId(recordId, tx);
      const now = new Date();

      let recordContentId: string;
      let shouldCreateSnapshot = false;
      let createdContent: Awaited<ReturnType<RecordContentRepository["create"]>> | null = null;

      if (!existing) {
        createdContent = await this.recordContentRepo.create({ recordId, content: dto.content as unknown as Prisma.InputJsonValue }, tx);
        recordContentId = createdContent.id;
        shouldCreateSnapshot = true;
      } else {
        recordContentId = existing.id;
        await this.recordContentRepo.update(recordId, { content: dto.content as unknown as Prisma.InputJsonValue, lastEditedAt: now }, tx);

        const lastSnapshot = await this.recordContentRepo.findLastSnapshot(recordContentId, tx);

        if (!lastSnapshot || now.getTime() - lastSnapshot.createdAt.getTime() > this.SNAPSHOT_INTERVAL_MS || dto.forceSnapshot) {
          shouldCreateSnapshot = true;
        }
      }

      if (shouldCreateSnapshot) {
        await this.manageSnapshots(recordContentId, dto.content as unknown as Prisma.InputJsonValue, tx);
      }

      const final = createdContent ?? (await this.recordContentRepo.findByRecordId(recordId, tx));
      return new RecordContentResponseDto({
        ...final!,
        content: final!.content as unknown as ContentSchema,
      });
    });

    this.logger.log("Record content updated", { recordId });
    return result;
  }

  async getSnapshots(recordId: string): Promise<RecordContentSnapshotResponseDto[]> {
    this.logger.debug("Getting record content snapshots", { recordId });

    const recordContent = await this.recordContentRepo.findByRecordId(recordId);
    if (!recordContent) return [];

    const snapshots = await this.recordContentRepo.findSnapshotsByContentId(recordContent.id);
    return snapshots.map(
      (snapshot) =>
        new RecordContentSnapshotResponseDto({
          ...snapshot,
          content: snapshot.content as unknown as ContentSchema,
        }),
    );
  }

  async restoreFromSnapshot(recordId: string, snapshotId: string): Promise<RecordContentResponseDto> {
    this.logger.debug("Restoring record content from snapshot", { recordId, snapshotId });

    const result = await this.recordContentRepo.transaction(async (tx) => {
      const snapshot = await this.recordContentRepo.findSnapshotById(snapshotId, tx);
      if (!snapshot) throw new NotFoundException(t("errors.SNAPSHOT_NOT_FOUND"));

      const recordContent = await this.recordContentRepo.findByRecordId(recordId, tx);
      if (!recordContent) throw new NotFoundException(t("errors.RECORD_CONTENT_NOT_FOUND"));
      if (recordContent.id !== snapshot.recordContentId) throw new NotFoundException(t("errors.SNAPSHOT_NOT_FOUND"));

      await this.recordContentRepo.update(recordId, { content: snapshot.content as Prisma.InputJsonValue, lastEditedAt: new Date() }, tx);

      await this.manageSnapshots(recordContent.id, snapshot.content as Prisma.InputJsonValue, tx);

      const updated = await this.recordContentRepo.findByRecordId(recordId, tx);
      return new RecordContentResponseDto({
        ...updated!,
        content: updated!.content as unknown as ContentSchema,
      });
    });

    this.logger.log("Record content restored from snapshot", { recordId, snapshotId });
    return result;
  }

  private async manageSnapshots(recordContentId: string, content: Prisma.InputJsonValue, tx: Prisma.TransactionClient) {
    const snapshotCount = await this.recordContentRepo.countSnapshots(recordContentId, tx);
    if (snapshotCount >= this.MAX_SNAPSHOTS) {
      await this.recordContentRepo.deleteOldestSnapshot(recordContentId, tx);
    }
    await this.recordContentRepo.createSnapshot(recordContentId, content, tx);
  }
}
