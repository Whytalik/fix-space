import { FilterField, FilterOperator, PropertyType, SortDirection, SortField } from "@fixspace/domain";
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
    views: [
      {
        name: "All Trades",
        icon: "icon:LayoutList",
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
      },
      {
        name: "Active Trades",
        icon: "icon:Activity",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Exit Price", "Exit Date", "Actual R", "Gross P&L", "Net P&L", "Outcome"],
      },
      {
        name: "Performance Log",
        icon: "icon:TrendingUp",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Closed",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Exit Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Initial SL", "Initial TP", "Planned R", "Confidence", "Emotion"],
      },
      {
        name: "By Session",
        icon: "icon:Clock",
        groupBy: "Session / Time",
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
      },
    ],
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
    views: [
      {
        name: "Chronological",
        icon: "icon:History",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
      },
      {
        name: "Analysis Mode",
        icon: "icon:SearchCode",
        hiddenColumns: ["Pair", "Date", "Account"],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
      },
    ],
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
    views: [
      {
        name: "Active Insights",
        icon: "icon:Zap",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
      },
      {
        name: "By Source",
        icon: "icon:Library",
        groupBy: "Source",
      },
    ],
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
    views: [
      {
        name: "Active Mistakes",
        icon: "icon:Flame",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
      },
      {
        name: "Resolved",
        icon: "icon:CheckCircle2",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Resolved",
          } as any,
        ],
      },
    ],
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
    views: [
      {
        name: "Monthly Reviews",
        icon: "icon:CalendarDays",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Period",
            operator: FilterOperator.EQUALS,
            value: "Monthly",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
      },
      {
        name: "Weekly Reviews",
        icon: "icon:Calendar",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Period",
            operator: FilterOperator.EQUALS,
            value: "Weekly",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
      },
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
    views: [
      {
        name: "Active Accounts",
        icon: "icon:ShieldCheck",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
      },
      {
        name: "Prop Firms",
        icon: "icon:Building",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Account Type",
            operator: FilterOperator.EQUALS,
            value: "Prop Firm",
          } as any,
        ],
      },
    ],
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
    views: [
      {
        name: "Withdrawals",
        icon: "icon:ArrowUpFromLine",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Type",
            operator: FilterOperator.EQUALS,
            value: "Withdrawal",
          } as any,
        ],
      },
      {
        name: "Deposits",
        icon: "icon:ArrowDownToLine",
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Type",
            operator: FilterOperator.EQUALS,
            value: "Deposit",
          } as any,
        ],
      },
    ],
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
  },
];

export const defaultInitializationConfig: InitializationConfig = {
  spaceIcon: "icon:Box",
  sections: [
    { key: "routine", name: "Routine", position: 0, icon: "icon:CalendarDays", color: "#818cf8" },
    { key: "insight", name: "Insight", position: 1, icon: "icon:Lightbulb", color: "#fbbf24" },
    { key: "settings", name: "Settings", position: 2, icon: "icon:Settings", color: "#a78bfa" },
  ],
  databases,
  defaultDatabaseProperties,
};
