import { Injectable, NotFoundException } from "@nestjs/common";
import { SpaceSearchResultDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { RecordRepository } from "../repositories/record.repository";
import { matchesSearch } from "../utils/record-search.util";

@Injectable()
export class SearchRecordsUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly spaceRepo: SpaceRepository,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(SearchRecordsUseCase.name);
  }

  async execute(spaceId: string, userId: string, q: string): Promise<SpaceSearchResultDto[]> {
    this.logger.debug("Searching records across space", { spaceId, q });

    const owner = await this.spaceRepo.findOwner(spaceId);

    if (owner?.ownerId !== userId) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id: spaceId }));
    }

    const records = await this.recordRepo.findAllBySpaceForSearch(spaceId, userId);
    const matched = records.filter((record) => matchesSearch(record, q));

    this.logger.debug("Space search complete", { spaceId, total: records.length, matched: matched.length });

    return matched.map(
      (record) =>
        new SpaceSearchResultDto({
          id: record.id,
          databaseId: record.databaseId,
          databaseTitle: record.database.title,
          sectionName: (record.database as any).section?.name ?? null,
          name: record.name,
          icon: record.icon,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          values: record.values.map(({ property, ...valueData }) => ({
            ...valueData,
            propertyName: property.name,
          })) as SpaceSearchResultDto["values"],
          content: (record as any).content?.content ?? null,
        }),
    );
  }
}
