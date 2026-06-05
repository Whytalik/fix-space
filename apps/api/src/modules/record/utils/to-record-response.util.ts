import type { Prisma } from "@fixspace/database";
import { RecordResponseDto } from "@fixspace/domain";

export function toRecordResponseDto(
  record: Prisma.RecordGetPayload<{ include: { values: true } }> | Record<string, unknown>,
): RecordResponseDto {
  return new RecordResponseDto({
    ...record,
    values: (record.values ?? []) as RecordResponseDto["values"],
  });
}
