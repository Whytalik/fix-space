import type { SeedRecord } from "./types";

export const dailyRoutineSeeds: SeedRecord[] = [
  {
    name: "Daily Log - 2025-01-15",
    relations: {
      Account: { type: "accounts", name: "FTMO 50k Challenge" },
      Trades: { type: "trading-journal", name: "EURUSD Intraday Long" },
      Notes: { type: "notes", name: "FVG Entry Rules" },
    },
    values: {
      Date: "2025-01-15",
      Pair: "EURUSD",
      Narrative: "Bullish",
      "Narrative Logic": "Asian session low sweep and displacement upwards",
      "Key Catalyst": ["CPI"],
      "Narrative Outcome": "Bullish",
      "Key Levels": "H4 OB at 1.0850, FVG 1.0920–1.0945, Daily resistance 1.1000",
    },
  },
  {
    name: "Daily Log - 2025-01-16",
    relations: {
      Account: { type: "accounts", name: "Live Account — IC Markets" },
      Trades: [
        { type: "trading-journal", name: "GBPUSD Swing Short" },
        { type: "trading-journal", name: "EURUSD Fomo Loss" },
      ],
      Notes: { type: "notes", name: "Order Block Identification" },
      Mistakes: { type: "mistakes", name: "Revenge Trading" },
    },
    values: {
      Date: "2025-01-16",
      Pair: "GBPUSD",
      Narrative: "Bearish",
      "Narrative Logic": "HTF resistance sweep and daily structure break",
      "Key Catalyst": ["FOMC"],
      "Narrative Outcome": "Bearish",
      "Key Levels": "Daily resistance 1.2750, 4H bearish OB 1.2700–1.2720, target 1.2580",
    },
  },
  {
    name: "Daily Log - 2025-01-17",
    relations: {
      Account: { type: "accounts", name: "FTMO 50k Challenge" },
      Trades: { type: "trading-journal", name: "XAUUSD Breakout Short" },
      Notes: { type: "notes", name: "Order Block Identification" },
    },
    values: {
      Date: "2025-01-17",
      Pair: "XAUUSD",
      Narrative: "Bearish",
      "Narrative Logic": "Sweep of HTF range high during London, looking for market structure shift and entry short",
      "Key Catalyst": ["Fed Speakers"],
      "Narrative Outcome": "Bearish",
      "Key Levels": "Daily high sweep level 2050, H1 OB 2046-2048, downside target 2030",
    },
  },
];
