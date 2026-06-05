import type { SeedRecord } from "./types";

export const mistakesSeeds: SeedRecord[] = [
  {
    name: "Revenge Trading",
    values: {
      Date: "2025-01-01",
      Category: ["Psychology"],
      "Prevention Rule": "Lock terminal after 2 consecutive losses.",
      Status: "Active",
    },
  },
  {
    name: "Early Exit",
    values: {
      Date: "2025-01-01",
      Category: ["Execution"],
      "Prevention Rule": "Let trades reach TP or SL completely.",
      Status: "Resolved",
      "Resolved Date": "2025-02-01",
    },
  },
];
