"use client";

import { createContext, useContext } from "react";

interface BlockSelectionValue {
  selectedBlockId: string | null;
  selectBlock: (id: string, deleteFn: () => void) => void;
  clearBlockSelection: () => void;
}

const defaultValue: BlockSelectionValue = {
  selectedBlockId: null,
  selectBlock: () => {},
  clearBlockSelection: () => {},
};

export const BlockSelectionContext = createContext<BlockSelectionValue>(defaultValue);

export function useBlockSelection() {
  return useContext(BlockSelectionContext);
}
