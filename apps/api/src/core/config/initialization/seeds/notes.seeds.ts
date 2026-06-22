import type { SeedRecord } from "./types";

export const notesSeeds: SeedRecord[] = [
  {
    name: "FVG Entry Rules",
    values: {
      Date: "2025-01-01",
      Category: ["Execution", "Rules"],
      Confidence: "Backtested",
      Source: ["Mentor"],
      "Market Regime": ["Bullish Trend", "Bearish Trend"],
      Status: "Active",
      Rating: 5,
      Pair: ["EURUSD", "GBPUSD"],
    },
  },
  {
    name: "Order Block Identification",
    values: {
      Date: "2025-01-01",
      Category: ["Analysis", "Strategy"],
      Confidence: "Live Observation",
      Source: ["Journal Review"],
      "Market Regime": ["Consolidation"],
      Status: "Active",
      Rating: 4,
      Pair: ["EURUSD", "GBPUSD", "XAUUSD"],
    },
  },
];
