import { Injectable, NotFoundException } from "@nestjs/common";
import { ContainerBlock, RecordContentResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";

@Injectable()
export class UpdateRecordContentUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(UpdateRecordContentUseCase.name);
  }

  async execute(recordId: string, userId: string, content: ContainerBlock): Promise<RecordContentResponseDto> {
    this.logger.debug("Updating record content", { recordId });

    const record = await this.recordRepo.findByIdForOwnerCheck(recordId, userId);

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    const updated = await this.recordRepo.upsertContent(recordId, content);

    this.logger.log("Record content updated", { recordId });

    return new RecordContentResponseDto(updated);
  }
}
