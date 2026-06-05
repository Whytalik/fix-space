import type { SeedRecord } from "./types";

export const notesSeeds: SeedRecord[] = [
  {
    name: "FVG Entry Rules",
    values: {
      Date: "2025-01-01",
      Category: ["Execution"],
      Confidence: "Backtested",
      Source: ["Mentor"],
      "Market Regime": ["Bullish Trend", "Bearish Trend"],
      Status: "Active",
    },
  },
  {
    name: "Order Block Identification",
    values: {
      Date: "2025-01-01",
      Category: ["Preparation"],
      Confidence: "Live Observation",
      Source: ["Journal Review"],
      "Market Regime": ["Consolidation"],
      Status: "Active",
    },
  },
];
