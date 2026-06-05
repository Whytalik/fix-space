import type { SeedRecord } from "./types";

export const dailyRoutineSeeds: SeedRecord[] = [
  {
    name: "Daily Log - 2025-01-15",
    relations: {
      Account: { type: "accounts", name: "Prop Account 50k" },
    },
    values: {
      Date: "2025-01-15",
      Pair: "EURUSD",
      Narrative: "Bullish",
      "Narrative Logic": "Asian session low sweep and displacement upwards",
      "Key Catalyst": ["CPI"],
      "Narrative Outcome": "Bullish",
    },
  },
  {
    name: "Daily Log - 2025-01-16",
    relations: {
      Account: { type: "accounts", name: "Personal Live Account" },
    },
    values: {
      Date: "2025-01-16",
      Pair: "GBPUSD",
      Narrative: "Bearish",
      "Narrative Logic": "HTF resistance sweep and daily structure break",
      "Key Catalyst": ["FOMC"],
      "Narrative Outcome": "Bearish",
    },
  },
];
