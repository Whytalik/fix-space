import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import {
  FilterField,
  FilterLogic,
  FilterOperator,
  RecordFilterDto,
  RecordResponseDto,
  RecordSortDto,
  SortDirection,
  SortField,
} from "@fixspace/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";
import { matchesFilter, RecordWithValues } from "../utils/record-filter.util";
import { matchesSearch } from "../utils/record-search.util";
import { compareRecords } from "../utils/record-sort.util";

interface RecordQueryOptions {
  page?: number;
  pageSize?: number;
  sort?: RecordSortDto[];
  filters?: RecordFilterDto[];
  filterLogic?: FilterLogic;
  search?: string;
}

function buildMetaDateCondition(operator: FilterOperator, value: unknown): Prisma.DateTimeFilter | null {
  const date = value !== null ? new Date(String(value)) : null;
  if (date === null || isNaN(date.getTime())) return null;
  switch (operator) {
    case FilterOperator.EQUALS:
      return { equals: date };
    case FilterOperator.BEFORE:
      return { lt: date };
    case FilterOperator.AFTER:
      return { gt: date };
    case FilterOperator.ON_OR_BEFORE:
      return { lte: date };
    case FilterOperator.ON_OR_AFTER:
      return { gte: date };
    default:
      return null;
  }
}

@Injectable()
export class FindRecordsUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(FindRecordsUseCase.name);
  }

  async execute(
    databaseId: string,
    userId: string,
    query: RecordQueryOptions,
  ): Promise<RecordResponseDto[] | { data: RecordResponseDto[]; total: number; page: number; pageSize: number }> {
    this.logger.debug("Finding records with advanced query", { databaseId, query });

    if (query.page !== undefined && query.pageSize !== undefined) {
      if (query.page < 1 || query.pageSize < 1) {
        throw new BadRequestException("page and pageSize must be positive integers");
      }
    }

    // Deduplicate sorts
    const seen = new Set<string>();
    const deduped = (query.sort ?? []).filter((sort) => {
      const key = sort.field === SortField.PROPERTY ? `prop:${sort.propertyId}` : `meta:${sort.field}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const sorts: RecordSortDto[] =
      deduped.length > 0 ? deduped : [{ field: SortField.CREATED_AT, direction: SortDirection.DESC }];

    const allFilters = query.filters ?? [];
    const filterLogic = query.filterLogic ?? FilterLogic.AND;

    // Push meta-field filters to Prisma WHERE when using AND logic
    const prismaMetaWhere: Prisma.RecordWhereInput = {};
    const pushedToDb = new Set<RecordFilterDto>();

    if (filterLogic === FilterLogic.AND) {
      for (const filterDto of allFilters) {
        if (filterDto.field !== FilterField.CREATED_AT && filterDto.field !== FilterField.UPDATED_AT) continue;
        const cond = buildMetaDateCondition(filterDto.operator, filterDto.value);
        if (cond === null) continue;
        if (filterDto.field === FilterField.CREATED_AT) {
          prismaMetaWhere.createdAt = { ...(prismaMetaWhere.createdAt as object), ...cond };
        } else {
          prismaMetaWhere.updatedAt = { ...(prismaMetaWhere.updatedAt as object), ...cond };
        }
        pushedToDb.add(filterDto);
      }
    }

    // Push meta-only sorts to Prisma ORDER BY
    const hasPropertySort = sorts.some((sort) => sort.field === SortField.PROPERTY);
    const prismaOrderBy: Prisma.RecordOrderByWithRelationInput[] | undefined = hasPropertySort
      ? undefined
      : sorts.map((sort) => ({ [sort.field]: sort.direction }));

    const records = await this.recordRepo.findWithFilters(
      databaseId,
      userId,
      Object.keys(prismaMetaWhere).length ? prismaMetaWhere : undefined,
      prismaOrderBy,
    );

    let filtered: RecordWithValues[] = records;

    if (query.search) {
      filtered = filtered.filter((record) => matchesSearch(record, query.search!));
    }

    // In-memory filters: OR logic uses all filters; AND logic uses only unpushed filters
    const inMemoryFilters =
      filterLogic === FilterLogic.OR ? allFilters : allFilters.filter((filterDto) => !pushedToDb.has(filterDto));

    if (inMemoryFilters.length > 0) {
      filtered = filtered.filter((record) => {
        if (filterLogic === FilterLogic.OR) {
          return inMemoryFilters.some((filter) => matchesFilter(record, filter));
        }
        return inMemoryFilters.every((filter) => matchesFilter(record, filter));
      });
    }

    // In-memory sort only when property sorts are present (meta sorts already applied by Prisma)
    if (hasPropertySort) {
      filtered = filtered.slice().sort((recordA, recordB) => compareRecords(recordA, recordB, sorts));
    }

    if (query.page !== undefined && query.pageSize !== undefined) {
      const page = query.page;
      const pageSize = query.pageSize;
      const total = filtered.length;
      const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

      this.logger.debug("Advanced paged records found", { databaseId, total, page, pageSize });

      return {
        data: slice.map((record) => new RecordResponseDto(record)),
        total,
        page,
        pageSize,
      };
    }

    return filtered.map((record) => new RecordResponseDto(record));
  }
}
