import type { DatabaseType } from "@fixspace/domain";
import type { SeedRecord } from "./types";
import { tradingJournalSeeds } from "./trading-journal.seeds";
import { dailyRoutineSeeds } from "./daily-routine.seeds";
import { notesSeeds } from "./notes.seeds";
import { mistakesSeeds } from "./mistakes.seeds";
import { accountsSeeds } from "./accounts.seeds";
import { operationsSeeds } from "./operations.seeds";
import { tradingSystemSeeds } from "./trading-system.seeds";
import { routineLibrarySeeds } from "./routine-library.seeds";
import { performanceReviewSeeds } from "./performance-review.seeds";
import { learningTasksSeeds } from "./learning-tasks.seeds";
import { economicEventsSeeds } from "./economic-events.seeds";
import { economicReleasesSeeds } from "./economic-releases.seeds";

export type { SeedRecord, SeedRelation } from "./types";
export { tradingJournalSeeds } from "./trading-journal.seeds";
export { dailyRoutineSeeds } from "./daily-routine.seeds";
export { notesSeeds } from "./notes.seeds";
export { mistakesSeeds } from "./mistakes.seeds";
export { accountsSeeds } from "./accounts.seeds";
export { operationsSeeds } from "./operations.seeds";
export { tradingSystemSeeds } from "./trading-system.seeds";
export { routineLibrarySeeds } from "./routine-library.seeds";
export { performanceReviewSeeds } from "./performance-review.seeds";
export { learningTasksSeeds } from "./learning-tasks.seeds";
export { economicEventsSeeds } from "./economic-events.seeds";
export { economicReleasesSeeds } from "./economic-releases.seeds";

export const seedsByDatabaseType: Partial<Record<DatabaseType, SeedRecord[]>> = {
  "trading-journal": tradingJournalSeeds,
  "daily-routine": dailyRoutineSeeds,
  notes: notesSeeds,
  mistakes: mistakesSeeds,
  accounts: accountsSeeds,
  operations: operationsSeeds,
  "trading-system": tradingSystemSeeds,
  "routine-library": routineLibrarySeeds,
  "performance-review": performanceReviewSeeds,
  "learning-tasks": learningTasksSeeds,
  "economic-events": economicEventsSeeds,
  "economic-releases": economicReleasesSeeds,
};
