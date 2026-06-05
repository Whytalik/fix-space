import type { SeedRecord } from "./types";

export const operationsSeeds: SeedRecord[] = [
  {
    name: "Initial Deposit (Prop)",
    relations: { Account: { type: "accounts", name: "Prop Account 50k" } },
    values: {
      Type: "Deposit",
      Date: "2025-01-01",
      Amount: 50000,
    },
  },
  {
    name: "Initial Deposit (Live)",
    relations: { Account: { type: "accounts", name: "Personal Live Account" } },
    values: {
      Type: "Deposit",
      Date: "2025-01-01",
      Amount: 10000,
    },
  },
  {
    name: "Personal Account Withdrawal",
    relations: { Account: { type: "accounts", name: "Personal Live Account" } },
    values: {
      Type: "Withdrawal",
      Date: "2025-02-01",
      Amount: 500,
    },
  },
];
