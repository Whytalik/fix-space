export interface PropertyConfig {
  version: number;
  [key: string]: unknown;
}

export const defaultPropertyConfig: PropertyConfig = {
  version: 1,
};
