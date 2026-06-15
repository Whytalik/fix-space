import type { Prisma } from "@fixspace/database";
import { DatabaseResponseDto } from "@fixspace/domain";

export function toDatabaseResponseDto(
  database: Prisma.DatabaseGetPayload<Record<string, never>> | Record<string, unknown>,
): DatabaseResponseDto {
  return new DatabaseResponseDto({
    ...database,
  });
}
