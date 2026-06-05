import type { SeedRecord } from "./types";

export const accountsSeeds: SeedRecord[] = [
  {
    name: "Prop Account 50k",
    values: {
      Started: "2025-01-01",
      "Account Type": "Funded",
      Status: "Active",
      "Starting Equity": 50000,
      "Current Equity": 52400,
    },
  },
  {
    name: "Personal Live Account",
    values: {
      Started: "2025-01-01",
      "Account Type": "Personal",
      Status: "Active",
      "Starting Equity": 10000,
      "Current Equity": 9800,
    },
  },
];
