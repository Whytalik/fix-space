import type { SeedRecord } from "./types";

export const performanceReviewSeeds: SeedRecord[] = [
  {
    name: "Weekly Review W03",
    relations: {
      Trades: [
        { type: "trading-journal", name: "EURUSD Intraday Long" },
        { type: "trading-journal", name: "GBPUSD Swing Short" },
        { type: "trading-journal", name: "XAUUSD Breakout Short" },
        { type: "trading-journal", name: "EURUSD Fomo Loss" },
      ],
      Mistakes: [
        { type: "mistakes", name: "Early Exit" },
        { type: "mistakes", name: "Revenge Trading" },
      ],
      "Daily Routines": [
        { type: "daily-routine", name: "Daily Log - 2025-01-15" },
        { type: "daily-routine", name: "Daily Log - 2025-01-16" },
        { type: "daily-routine", name: "Daily Log - 2025-01-17" },
      ],
      "Trading Systems": [
        { type: "trading-system", name: "Intraday Strategy" },
        { type: "trading-system", name: "Swing Strategy" },
      ],
    },
    values: {
      Date: "2025-01-19",
      Period: "Weekly",
      "Period Start": "2025-01-13",
      "Period End": "2025-01-17",
      Grade: "B+",
      "Profit Factor": 2.8,
      "Max Drawdown %": 1.5,
      "Discipline Score": 3.5,
      "Psychology Score": 3,
      "Process Score": 4,
    },
  },
  {
    name: "Monthly Review January",
    relations: {
      Trades: [
        { type: "trading-journal", name: "EURUSD Intraday Long" },
        { type: "trading-journal", name: "GBPUSD Swing Short" },
        { type: "trading-journal", name: "XAUUSD Breakout Short" },
        { type: "trading-journal", name: "EURUSD Fomo Loss" },
      ],
      Mistakes: [
        { type: "mistakes", name: "Revenge Trading" },
        { type: "mistakes", name: "Early Exit" },
      ],
      "Trading Systems": [
        { type: "trading-system", name: "Intraday Strategy" },
        { type: "trading-system", name: "Swing Strategy" },
      ],
      Notes: [
        { type: "notes", name: "FVG Entry Rules" },
        { type: "notes", name: "Order Block Identification" },
      ],
    },
    values: {
      Date: "2025-01-31",
      Period: "Monthly",
      "Period Start": "2025-01-01",
      "Period End": "2025-01-31",
      Grade: "B",
      "Profit Factor": 2.1,
      "Max Drawdown %": 3.8,
      "Discipline Score": 3,
      "Psychology Score": 2.5,
      "Process Score": 4,
    },
  },
];
