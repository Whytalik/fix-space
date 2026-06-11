import type {
  ContentImageResponseDto,
  RecordContentResponseDto,
  RecordContentSnapshotResponseDto,
  UpdateRecordContentDto,
} from "@fixspace/domain";
import { apiFetch } from "./client";

export function getRecordContent(recordId: string): Promise<RecordContentResponseDto> {
  return apiFetch<RecordContentResponseDto>(`/records/${recordId}/content`);
}

export function updateRecordContent(recordId: string, dto: UpdateRecordContentDto): Promise<RecordContentResponseDto> {
  return apiFetch<RecordContentResponseDto>(`/records/${recordId}/content`, {
    method: "PATCH",
    body: dto,
  });
}

export function getRecordContentSnapshots(recordId: string): Promise<RecordContentSnapshotResponseDto[]> {
  return apiFetch<RecordContentSnapshotResponseDto[]>(`/records/${recordId}/content/snapshots`);
}

export function restoreRecordContentSnapshot(recordId: string, snapshotId: string): Promise<RecordContentResponseDto> {
  return apiFetch<RecordContentResponseDto>(`/records/${recordId}/content/snapshots/${snapshotId}/restore`, { method: "POST" });
}

export function uploadContentImage(recordId: string, file: File): Promise<ContentImageResponseDto> {
  const form = new FormData();
  form.append("image", file);
  return apiFetch<ContentImageResponseDto>(`/records/${recordId}/content/images`, {
    method: "POST",
    body: form,
  });
}
