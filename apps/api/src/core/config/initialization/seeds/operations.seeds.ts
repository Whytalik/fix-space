import type { SeedRecord } from "./types";

export const operationsSeeds: SeedRecord[] = [
  {
    name: "Initial Deposit (Prop)",
    relations: { Account: { type: "accounts", name: "FTMO 50k Challenge" } },
    values: {
      Type: "Deposit",
      Status: "Completed",
      Date: "2025-01-01",
      "Settlement Date": "2025-01-01",
      Amount: 50000,
      "Payment Method": "Bank Wire",
      Reference: "TXN-20250101-001",
      Fee: 0,
      Notes: "Starting balance funded by prop firm",
    },
  },
  {
    name: "Initial Deposit (Live)",
    relations: { Account: { type: "accounts", name: "Live Account — IC Markets" } },
    values: {
      Type: "Deposit",
      Status: "Completed",
      Date: "2025-01-01",
      "Settlement Date": "2025-01-02",
      Amount: 10000,
      "Payment Method": "Bank Wire",
      Reference: "TXN-20250101-002",
      Fee: 15.0,
      Notes: "Initial bank wire to IC Markets live account",
    },
  },
  {
    name: "Profit Withdrawal",
    relations: { Account: { type: "accounts", name: "Live Account — IC Markets" } },
    values: {
      Type: "Withdrawal",
      Status: "Completed",
      Date: "2025-02-01",
      "Settlement Date": "2025-02-03",
      Amount: 500,
      Fee: 5,
      "Payment Method": "Wise",
      Reference: "TXN-20250201-089",
      Notes: "Regular profit cash out to Wise wallet",
    },
  },
  {
    name: "Prop Firm Payout",
    relations: { Account: { type: "accounts", name: "FTMO 50k Challenge" } },
    values: {
      Type: "Withdrawal",
      Status: "Completed",
      Date: "2025-03-15",
      "Settlement Date": "2025-03-18",
      Amount: 2000,
      Fee: 0,
      "Payment Method": "Bank Wire",
      Reference: "TXN-20250315-112",
      Notes: "First funded payout — 80% profit split",
    },
  },
];
