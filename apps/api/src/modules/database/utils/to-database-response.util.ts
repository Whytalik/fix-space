import type { Prisma } from "@fixspace/database";
import { DatabaseResponseDto, type DatabaseConfigDto } from "@fixspace/domain";

export function toDatabaseResponseDto(
  database: Prisma.DatabaseGetPayload<Record<string, never>> | Record<string, unknown>,
): DatabaseResponseDto {
  return new DatabaseResponseDto({
    ...database,
    config: database.config as DatabaseConfigDto,
  });
}
