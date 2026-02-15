export interface RecordConfig {
  version: number;
  [key: string]: unknown;
}

export const defaultRecordConfig: RecordConfig = {
  version: 1,
};
