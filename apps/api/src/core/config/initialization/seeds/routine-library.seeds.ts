import type { SeedRecord } from "./types";

export const routineLibrarySeeds: SeedRecord[] = [
  {
    name: "Swing Strategy SOP",
    values: {
      Date: "2025-01-01",
      "Sleep Quality": 5,
      "Pre-Market State": ["Calm"],
      "Post-Market State": ["Calm"],
      "Plan Adherence": 5,
      Distractions: [],
    },
  },
  {
    name: "Intraday SOP",
    values: {
      Date: "2025-01-01",
      "Sleep Quality": 4,
      "Pre-Market State": ["Anxious"],
      "Post-Market State": ["Calm"],
      "Plan Adherence": 4,
      Distractions: ["Phone"],
    },
  },
];
