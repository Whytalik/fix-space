import { Injectable, NotFoundException } from "@nestjs/common";
import { RecordContentResponseDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";

@Injectable()
export class GetRecordContentUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(GetRecordContentUseCase.name);
  }

  async execute(recordId: string, userId: string): Promise<RecordContentResponseDto> {
    this.logger.debug("Getting record content", { recordId });

    const record = await this.recordRepo.findByIdForOwnerCheck(recordId, userId);

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    let content = await this.recordRepo.findContent(recordId);

    if (!content) {
      this.logger.debug("No content found, initialising empty content", { recordId });
      content = await this.recordRepo.upsertContent(recordId, {});
    }

    this.logger.debug("Record content retrieved", { recordId });

    return new RecordContentResponseDto(content);
  }
}
