export interface SpaceConfig {
  version: number;
  [key: string]: unknown;
}

export const defaultSpaceConfig: SpaceConfig = {
  version: 1,
};