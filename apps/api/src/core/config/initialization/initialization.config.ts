import { PropertyType } from "@fixspace/domain";
import { accountsProperties } from "./databases/accounts.config";
import { dailyRoutineProperties } from "./databases/daily-routine.config";
import { mistakesProperties } from "./databases/mistakes.config";
import { notesProperties } from "./databases/notes.config";
import { operationsProperties } from "./databases/operations.config";
import { tradingJournalProperties } from "./databases/trading-journal.config";
import { tradingSystemProperties } from "./databases/trading-system.config";
import { routineLibraryProperties } from "./databases/routine-library.config";
import { performanceReviewProperties } from "./databases/performance-review.config";
import { seedsByDatabaseType } from "./seeds";
import type { DatabaseTemplate, InitializationConfig, InitPropertyDef } from "./types";
export type { InitializationConfig } from "./types";

const databases: DatabaseTemplate[] = [
  {
    name: "[DB] Trading Journal",
    title: "Trading Journal",
    type: "trading-journal",
    icon: "icon:BookOpen",
    sectionKey: "routine",
    seeds: seedsByDatabaseType["trading-journal"],
    properties: tradingJournalProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Session Routine",
    title: "Session Routine",
    type: "daily-routine",
    icon: "icon:CalendarCheck",
    sectionKey: "routine",
    seeds: seedsByDatabaseType["daily-routine"],
    properties: dailyRoutineProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Routine Library",
    title: "Routine Library",
    type: "routine-library",
    icon: "icon:Compass",
    sectionKey: "routine",
    seeds: seedsByDatabaseType["routine-library"],
    properties: routineLibraryProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Notes",
    title: "Notes",
    type: "notes",
    icon: "icon:StickyNote",
    sectionKey: "insight",
    seeds: seedsByDatabaseType["notes"],
    properties: notesProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Mistakes",
    title: "Mistakes",
    type: "mistakes",
    icon: "icon:TriangleAlert",
    sectionKey: "insight",
    seeds: seedsByDatabaseType["mistakes"],
    properties: mistakesProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Performance Review",
    title: "Performance Review",
    type: "performance-review",
    icon: "icon:ChartLine",
    sectionKey: "insight",
    seeds: seedsByDatabaseType["performance-review"],
    properties: performanceReviewProperties,
    templates: [
      { name: "Weekly Review", isDefault: true, position: 0 },
      { name: "Monthly Review", isDefault: false, position: 1 },
      { name: "Quarterly Review", isDefault: false, position: 2 },
    ],
  },
  {
    name: "[DB] Accounts",
    title: "Accounts",
    type: "accounts",
    icon: "icon:Wallet",
    sectionKey: "settings",
    seeds: seedsByDatabaseType["accounts"],
    properties: accountsProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Operations",
    title: "Operations",
    type: "operations",
    icon: "icon:ArrowLeftRight",
    sectionKey: "settings",
    seeds: seedsByDatabaseType["operations"],
    properties: operationsProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
  {
    name: "[DB] Trading Systems",
    title: "Trading Systems",
    type: "trading-system",
    icon: "icon:Target",
    sectionKey: "settings",
    seeds: seedsByDatabaseType["trading-system"],
    properties: tradingSystemProperties,
    templates: [{ name: "Default", isDefault: true, position: 0 }],
  },
];

const defaultDatabaseProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    isRequired: true,
  },
];

export const defaultInitializationConfig: InitializationConfig = {
  spaceIcon: "icon:LayoutDashboard",
  sections: [
    { key: "routine", name: "Routine", position: 0, icon: "icon:CalendarDays", color: "#818cf8" },
    { key: "insight", name: "Insight", position: 1, icon: "icon:Lightbulb", color: "#fbbf24" },
    { key: "settings", name: "Settings", position: 2, icon: "icon:Settings", color: "#a78bfa" },
  ],
  databases,
  defaultDatabaseProperties,
};
