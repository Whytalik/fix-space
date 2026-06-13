import type { SeedRecord } from "./types";

export const economicReleasesSeeds: SeedRecord[] = [
  {
    name: "FOMC Decision - Feb 2025",
    values: {
      Release: "FOMC Decision - Feb 2025",
      Date: "2025-02-01T21:00:00.000Z",
      Forecast: "5.50%",
      Previous: "5.50%",
      Actual: "5.50%",
    },
    relations: {
      Event: { type: "economic-events", name: "FOMC Interest Rate Decision" },
    },
  },
  {
    name: "NFP Release - Feb 2025",
    values: {
      Release: "NFP Release - Feb 2025",
      Date: "2025-02-07T15:30:00.000Z",
      Forecast: "185K",
      Previous: "175K",
      Actual: "210K",
    },
    relations: {
      Event: { type: "economic-events", name: "US Non-Farm Employment Change (NFP)" },
    },
  },
  {
    name: "ECB Statement - Feb 2025",
    values: {
      Release: "ECB Statement - Feb 2025",
      Date: "2025-02-13T14:45:00.000Z",
      Forecast: "4.25%",
      Previous: "4.50%",
      Actual: "4.25%",
    },
    relations: {
      Event: { type: "economic-events", name: "ECB Monetary Policy Statement" },
    },
  },
];
