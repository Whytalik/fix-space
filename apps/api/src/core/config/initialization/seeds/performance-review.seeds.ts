import type { SeedRecord } from "./types";

export const performanceReviewSeeds: SeedRecord[] = [
  {
    name: "Weekly Review W03",
    relations: {
      Account: { type: "accounts", name: "Prop Account 50k" },
      Mistakes: { type: "mistakes", name: "Early Exit" },
    },
    values: {
      Date: "2025-01-19",
      Period: "Weekly",
      "Period Start": "2025-01-12",
      "Period End": "2025-01-18",
      Grade: "A",
    },
  },
  {
    name: "Monthly Review January",
    relations: {
      Account: { type: "accounts", name: "Personal Live Account" },
      Mistakes: { type: "mistakes", name: "Revenge Trading" },
    },
    values: {
      Date: "2025-01-31",
      Period: "Monthly",
      "Period Start": "2025-01-01",
      "Period End": "2025-01-31",
      Grade: "B",
    },
  },
];
