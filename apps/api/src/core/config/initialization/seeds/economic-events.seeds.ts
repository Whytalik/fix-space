import type { SeedRecord } from "./types";

export const economicEventsSeeds: SeedRecord[] = [
  {
    name: "FOMC Interest Rate Decision",
    values: {
      Event: "FOMC Interest Rate Decision",
      Currency: "USD",
      Impact: "High",
      "Avoid Trading": true,
    },
  },
  {
    name: "US Non-Farm Employment Change (NFP)",
    values: {
      Event: "US Non-Farm Employment Change (NFP)",
      Currency: "USD",
      Impact: "High",
      "Avoid Trading": true,
    },
  },
  {
    name: "ECB Monetary Policy Statement",
    values: {
      Event: "ECB Monetary Policy Statement",
      Currency: "EUR",
      Impact: "High",
      "Avoid Trading": true,
    },
  },
];
