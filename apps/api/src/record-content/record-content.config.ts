export interface RecordContentConfig {
  version: number;
  [key: string]: unknown;
}

export const defaultRecordContentConfig: RecordContentConfig = {
  version: 1,
};
