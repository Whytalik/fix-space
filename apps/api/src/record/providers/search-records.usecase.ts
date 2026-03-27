import { Injectable, NotFoundException } from "@nestjs/common";
import { SpaceSearchResultDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SpaceRepository } from "../../space/space.repository";
import { RecordRepository } from "../record.repository";
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
      throw new NotFoundException(`Space with id ${spaceId} not found`);
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
          name: record.name,
          icon: record.icon,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          values: record.values.map(({ property, ...pv }) => ({
            ...pv,
            propertyName: property.name,
          })) as SpaceSearchResultDto["values"],
        }),
    );
  }
}
