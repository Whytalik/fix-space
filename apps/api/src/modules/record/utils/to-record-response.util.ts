import { RecordResponseDto } from "@fixspace/domain";

export function toRecordResponseDto(record: Record<string, unknown>): RecordResponseDto {
  const rawValues = (record.values ?? []) as Array<Record<string, unknown>>;
  return new RecordResponseDto({
    ...record,
    values: rawValues.map((value) => {
      const propertyRecord = value.property as Record<string, unknown> | undefined;
      return {
        ...value,
        propertyName: (propertyRecord?.name as string | undefined) ?? (value.propertyName as string | undefined),
      };
    }) as RecordResponseDto["values"],
  });
}
