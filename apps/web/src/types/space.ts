import type { SpaceResponseDto } from "@nucleus/domain";

export type SpaceState = {
  spaces: SpaceResponseDto[];
  currentSpaceId: string | null;
};

export type SpaceAction =
  | { type: "INITIALIZE"; spaces: SpaceResponseDto[]; currentSpaceId: string | null }
  | { type: "SET_CURRENT"; spaceId: string | null }
  | { type: "ADD"; space: SpaceResponseDto }
  | { type: "REMOVE"; spaceId: string; fallbackId: string | null }
  | { type: "UPDATE_IN_LIST"; space: SpaceResponseDto }
  | { type: "PATCH"; fn: (s: SpaceResponseDto) => SpaceResponseDto }
  | { type: "RESET" };
