import { Injectable, NotFoundException } from "@nestjs/common";
import { BlockType, RecordContentResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { RecordRepository } from "../repositories/record.repository";

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
    content ??= await this.recordRepo.upsertContent(recordId, {
      id: crypto.randomUUID(),
      type: BlockType.ROW,
      columns: 1,
      children: [],
    });

    this.logger.debug("Record content retrieved", { recordId });

    return new RecordContentResponseDto(content);
  }
}
