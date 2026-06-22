import {
  AutomationActionType,
  AutomationTrigger,
  DatePreset,
  FilterField,
  FilterOperator,
  PropertyType,
  SortDirection,
  SortField,
  SummaryMetric,
  ValueType,
} from "@fixspace/domain";
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
    name: "Trading Journal",
    type: "trading-journal",
    icon: "icon:BookOpen",
    isKey: true,
    sectionKey: "routine",
    seeds: seedsByDatabaseType["trading-journal"],
    properties: tradingJournalProperties,
    applyDefaultTemplateToSeeds: true,
    templates: [
      {
        name: "Trade Review",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-setup-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-setup-heading",
                  width: 100,
                  children: [{ id: "heading-setup", type: "HEADING", data: { html: "Trade Setup", level: 2 } }],
                },
              ],
            },
            {
              id: "row-thesis",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-thesis",
                  width: 100,
                  children: [
                    {
                      id: "callout-thesis",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:TrendingUp", title: "Trade Thesis", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-setup-chart",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-setup-chart",
                  width: 100,
                  children: [
                    {
                      id: "image-setup-chart",
                      type: "IMAGE",
                      data: {
                        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
                        align: "center",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-exec-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-exec-heading",
                  width: 100,
                  children: [{ id: "heading-exec", type: "HEADING", data: { html: "Execution Notes", level: 2 } }],
                },
              ],
            },
            {
              id: "row-exec-text",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-exec-text",
                  width: 100,
                  children: [{ id: "text-exec", type: "TEXT", data: { html: "" } }],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-metrics-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-metrics-heading",
                  width: 100,
                  children: [{ id: "heading-metrics", type: "HEADING", data: { html: "Trade Analytics", level: 2 } }],
                },
              ],
            },
            {
              id: "row-metrics-charts",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-metrics-bar",
                  width: 50,
                  children: [
                    {
                      id: "chart-tj-r-metrics",
                      type: "CHART",
                      data: {
                        chartType: "bar",
                        title: "Risk vs R (Planned vs Actual)",
                        source: {
                          type: "record-properties",
                          fields: ["Risk %", "Planned R", "Actual R"],
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-metrics-radar",
                  width: 50,
                  children: [
                    {
                      id: "chart-tj-quality-radar",
                      type: "CHART",
                      data: {
                        chartType: "radar",
                        title: "Trade Quality Profile",
                        source: {
                          type: "record-properties",
                          fields: ["Confidence", "Setup Quality"],
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-metrics",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-metrics",
                  width: 100,
                  children: [{ id: "divider-metrics", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-review-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-review-heading",
                  width: 100,
                  children: [{ id: "heading-review", type: "HEADING", data: { html: "Post-Trade Review", level: 2 } }],
                },
              ],
            },
            {
              id: "row-went-well",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-went-well",
                  width: 100,
                  children: [
                    {
                      id: "callout-went-well",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:CheckCircle2", title: "What Went Well", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mistakes",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mistakes",
                  width: 100,
                  children: [
                    {
                      id: "callout-mistakes",
                      type: "CALLOUT",
                      data: { type: "warning", icon: "icon:TriangleAlert", title: "Mistakes Made", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-lesson",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-lesson",
                  width: 100,
                  children: [
                    {
                      id: "callout-lesson",
                      type: "CALLOUT",
                      data: { type: "custom", icon: "icon:Lightbulb", title: "Key Lesson", html: "" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-set Active",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Active",
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-fill Entry Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Entry Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Exit Date",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Closed" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Exit Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Broken Plan → Mistakes",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Plan Adherence",
          condition: { type: "equals", value: "Broken" },
        },
        actions: [
          {
            type: AutomationActionType.CREATE_RECORD,
            sourceDatabaseType: "mistakes",
            fieldMappings: [
              { targetPropertyName: "Name", valueType: ValueType.FIXED, value: "Plan Adherence Broken" },
              { targetPropertyName: "Category", valueType: ValueType.FIXED, value: "Psychology" },
              { targetPropertyName: "Date", valueType: ValueType.TODAY },
            ],
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "All Trades",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Initial SL",
          "Initial TP",
          "Planned R",
          "Execution Timeframe",
          "Point A (Origin)",
          "Point B (Target)",
          "Setup Quality",
          "MFE (Max Fav)",
          "MAE (Max Adv)",
          "Exit Efficiency",
          "Hold Time",
          "Emotion",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Pair: SummaryMetric.UNIQUE,
          "Net P&L": SummaryMetric.SUM,
          "Actual R": SummaryMetric.AVERAGE,
          "Risk %": SummaryMetric.AVERAGE,
          Outcome: SummaryMetric.UNIQUE,
          "Entry Date": SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "Active Trades",
        icon: "icon:Activity",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Exit Price",
          "Exit Date",
          "Actual R",
          "Gross P&L",
          "Net P&L",
          "Outcome",
          "Fees",
          "Planned R",
          "MFE (Max Fav)",
          "MAE (Max Adv)",
          "Exit Efficiency",
          "Hold Time",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Pair: SummaryMetric.UNIQUE,
          "Risk %": SummaryMetric.AVERAGE,
          "Risk Amount ($)": SummaryMetric.SUM,
          Confidence: SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Performance Log",
        icon: "icon:TrendingUp",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Closed",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Exit Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Initial SL",
          "Initial TP",
          "Planned R",
          "Confidence",
          "Emotion",
          "Point A (Origin)",
          "Point B (Target)",
          "Setup Quality",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Pair: SummaryMetric.UNIQUE,
          "Net P&L": SummaryMetric.SUM,
          "Gross P&L": SummaryMetric.SUM,
          "Actual R": SummaryMetric.AVERAGE,
          Outcome: SummaryMetric.UNIQUE,
          "Exit Date": SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "By Session",
        icon: "icon:Clock",
        position: 3,
        recordLimit: 10,
        groupBy: "Session / Time",
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Initial SL",
          "Initial TP",
          "Planned R",
          "Quantity",
          "Fees",
          "Entry Price",
          "Exit Price",
          "Point A (Origin)",
          "Point B (Target)",
          "MFE (Max Fav)",
          "MAE (Max Adv)",
          "Exit Efficiency",
          "Hold Time",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Pair: SummaryMetric.UNIQUE,
          "Net P&L": SummaryMetric.SUM,
          "Actual R": SummaryMetric.AVERAGE,
          "Gross P&L": SummaryMetric.SUM,
          Outcome: SummaryMetric.UNIQUE,
        } as any,
      },
      {
        name: "By Pair",
        icon: "icon:TrendingUp",
        position: 4,
        recordLimit: 10,
        groupBy: "Pair",
        sort: [{ field: SortField.PROPERTY, propertyName: "Entry Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Initial SL",
          "Initial TP",
          "Planned R",
          "Quantity",
          "Fees",
          "Entry Price",
          "Exit Price",
          "Point A (Origin)",
          "Point B (Target)",
          "MFE (Max Fav)",
          "MAE (Max Adv)",
          "Exit Efficiency",
          "Hold Time",
          "Session / Time",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Net P&L": SummaryMetric.SUM,
          "Gross P&L": SummaryMetric.SUM,
          "Actual R": SummaryMetric.AVERAGE,
          Outcome: SummaryMetric.UNIQUE,
          "Entry Date": SummaryMetric.LATEST,
        } as any,
      },
    ],
  },
  {
    name: "Session Routine",
    type: "daily-routine",
    icon: "icon:CalendarCheck",
    isKey: true,
    sectionKey: "routine",
    seeds: seedsByDatabaseType["daily-routine"],
    properties: dailyRoutineProperties,
    templates: [
      {
        name: "Session Log",
        namePattern: "Session {{today}}",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-premarket-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-premarket-heading",
                  width: 100,
                  children: [{ id: "heading-premarket", type: "HEADING", data: { html: "Pre-Market Preparation", level: 2 } }],
                },
              ],
            },
            {
              id: "row-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-premarket",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "item-1", text: "Review HTF structure (H4 / Daily / Weekly)", checked: false },
                          { id: "item-2", text: "Mark key levels, FVGs, and order blocks on chart", checked: false },
                          { id: "item-3", text: "Check economic calendar for high-impact events", checked: false },
                          { id: "item-4", text: "Review overnight session for sweeps or displacement", checked: false },
                          { id: "item-5", text: "Set risk parameters and lot size for today", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-analysis-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-analysis-heading",
                  width: 100,
                  children: [{ id: "heading-analysis", type: "HEADING", data: { html: "Market Analysis", level: 2 } }],
                },
              ],
            },
            {
              id: "row-bias",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-bias",
                  width: 100,
                  children: [
                    {
                      id: "callout-bias",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:TrendingUp", title: "Market Bias", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-levels-text",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-levels-text",
                  width: 100,
                  children: [{ id: "text-levels", type: "TEXT", data: { html: "" } }],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-review-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-review-heading",
                  width: 100,
                  children: [{ id: "heading-review", type: "HEADING", data: { html: "Session Review", level: 2 } }],
                },
              ],
            },
            {
              id: "row-went-well",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-went-well",
                  width: 100,
                  children: [
                    {
                      id: "callout-went-well",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:CheckCircle2", title: "What Went Well", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-lessons",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-lessons",
                  width: 100,
                  children: [
                    {
                      id: "callout-lessons",
                      type: "CALLOUT",
                      data: { type: "warning", icon: "icon:TriangleAlert", title: "Mistakes & Lessons", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-conclusion",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-conclusion",
                  width: 100,
                  children: [
                    {
                      id: "callout-conclusion",
                      type: "CALLOUT",
                      data: { type: "custom", icon: "icon:ClipboardCheck", title: "Daily Conclusion", html: "" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "Chronological",
        icon: "icon:History",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Key Levels", "Narrative Logic"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Pair: SummaryMetric.UNIQUE,
          Narrative: SummaryMetric.UNIQUE,
          "Narrative Accuracy": SummaryMetric.UNIQUE,
          "Session P&L": SummaryMetric.SUM,
          "Trade Count": SummaryMetric.SUM,
          Trades: SummaryMetric.COUNT_FILLED,
          Mistakes: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "Analysis Mode",
        icon: "icon:SearchCode",
        position: 1,
        recordLimit: 10,
        hiddenColumns: ["Pair", "Date", "Account", "Name", "Key Levels"],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Narrative: SummaryMetric.UNIQUE,
          "Narrative Outcome": SummaryMetric.UNIQUE,
          "Narrative Accuracy": SummaryMetric.UNIQUE,
          "Session P&L": SummaryMetric.SUM,
          "Trade Count": SummaryMetric.SUM,
          Trades: SummaryMetric.COUNT_FILLED,
          Mistakes: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "Today",
        icon: "icon:Calendar",
        position: 2,
        recordLimit: 10,
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.TODAY } as any],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Key Levels", "Narrative Logic", "Account"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Pair: SummaryMetric.UNIQUE,
          "Session P&L": SummaryMetric.SUM,
          "Trade Count": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "This Week",
        icon: "icon:CalendarRange",
        position: 3,
        recordLimit: 10,
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.THIS_WEEK } as any],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Key Levels", "Narrative Logic", "Account", "Mistakes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.DATE_RANGE,
          Pair: SummaryMetric.UNIQUE,
          "Session P&L": SummaryMetric.SUM,
          "Trade Count": SummaryMetric.SUM,
          Trades: SummaryMetric.COUNT_FILLED,
          Mistakes: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "By Pair",
        icon: "icon:TrendingUp",
        position: 4,
        recordLimit: 10,
        groupBy: "Pair",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Key Levels", "Narrative Logic", "Account"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Narrative Accuracy": SummaryMetric.UNIQUE,
          "Session P&L": SummaryMetric.SUM,
          "Trade Count": SummaryMetric.SUM,
          Date: SummaryMetric.LATEST,
        } as any,
      },
    ],
  },
  {
    name: "Routine Library",
    type: "routine-library",
    icon: "icon:Compass",
    sectionKey: "routine",
    seeds: seedsByDatabaseType["routine-library"],
    properties: routineLibraryProperties,
    templates: [
      {
        name: "Routine Library",
        namePattern: "Routine Library {{today}}",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-premarket-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-premarket-heading",
                  width: 100,
                  children: [{ id: "heading-premarket", type: "HEADING", data: { html: "Pre-Market Checklist", level: 2 } }],
                },
              ],
            },
            {
              id: "row-premarket-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-premarket-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-premarket",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "pm-1", text: "Review yesterday's journal and open mistakes", checked: false },
                          { id: "pm-2", text: "Check economic calendar — mark high-impact events", checked: false },
                          { id: "pm-3", text: "Assess mental state: sleep, stress, emotions", checked: false },
                          { id: "pm-4", text: "Mark H4 / Daily key levels and order blocks", checked: false },
                          { id: "pm-5", text: "Define today's narrative and bias", checked: false },
                          { id: "pm-6", text: "Set daily risk limit and max position size", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [{ id: "col-divider-1", width: 100, children: [{ id: "divider-1", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-session-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-session-heading",
                  width: 100,
                  children: [{ id: "heading-session", type: "HEADING", data: { html: "During Session Rules", level: 2 } }],
                },
              ],
            },
            {
              id: "row-session-rules",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-session-rules",
                  width: 100,
                  children: [
                    {
                      id: "list-session-rules",
                      type: "LIST",
                      data: {
                        listType: "numbered",
                        items: [
                          { id: "r-1", html: "Enter only if all checklist criteria are met" },
                          { id: "r-2", html: "No trades 30 min before / after high-impact news" },
                          { id: "r-3", html: "Stop if daily loss limit is reached — no exceptions" },
                          { id: "r-4", html: "Max 3 setups per session — quality over quantity" },
                          { id: "r-5", html: "Log every trade immediately after entry" },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-red-flags",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-red-flags",
                  width: 100,
                  children: [
                    {
                      id: "callout-red-flags",
                      type: "CALLOUT",
                      data: {
                        type: "danger",
                        icon: "icon:OctagonAlert",
                        title: "Stop Trading If…",
                        html: "Two consecutive losses • Emotional state is Anxious/Revenge • Daily drawdown > 2% • Plan adherence = Broken",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [{ id: "col-divider-2", width: 100, children: [{ id: "divider-2", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-postmarket-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-postmarket-heading",
                  width: 100,
                  children: [{ id: "heading-postmarket", type: "HEADING", data: { html: "Post-Session Review", level: 2 } }],
                },
              ],
            },
            {
              id: "row-postmarket-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-postmarket-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-postmarket",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "po-1", text: "All trades logged with entry model and context", checked: false },
                          { id: "po-2", text: "Rate plan adherence honestly (1–5)", checked: false },
                          { id: "po-3", text: "Note lessons learned in Notes database", checked: false },
                          { id: "po-4", text: "Record any mistakes in Mistakes database", checked: false },
                          { id: "po-5", text: "Check final P&L vs daily limit", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-conclusion",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-conclusion",
                  width: 100,
                  children: [
                    {
                      id: "callout-conclusion",
                      type: "CALLOUT",
                      data: { type: "custom", icon: "icon:ClipboardCheck", title: "Daily Conclusion", html: "" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Low Adherence → Mistakes",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Plan Adherence",
          condition: { type: "equals", value: 1 },
        },
        actions: [
          {
            type: AutomationActionType.CREATE_RECORD,
            sourceDatabaseType: "mistakes",
            fieldMappings: [
              { targetPropertyName: "Name", valueType: ValueType.FIXED, value: "Low SOP Adherence" },
              { targetPropertyName: "Category", valueType: ValueType.FIXED, value: "Psychology" },
              { targetPropertyName: "Date", valueType: ValueType.TODAY },
            ],
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "All SOPs",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Name", direction: SortDirection.ASC } as any],
        hiddenColumns: ["Date", "Pre-Market State", "Post-Market State", "Distractions", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          "Sleep Quality": SummaryMetric.AVERAGE,
          "Plan Adherence": SummaryMetric.AVERAGE,
          Distractions: SummaryMetric.COUNT_FILLED,
          "Daily Routines": SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "Today",
        icon: "icon:Calendar",
        position: 1,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.TODAY } as any],
        hiddenColumns: ["Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Sleep Quality": SummaryMetric.AVERAGE,
          "Pre-Market State": SummaryMetric.UNIQUE,
          "Post-Market State": SummaryMetric.UNIQUE,
          "Plan Adherence": SummaryMetric.AVERAGE,
          Distractions: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "This Week",
        icon: "icon:CalendarRange",
        position: 2,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.THIS_WEEK } as any],
        hiddenColumns: ["Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.DATE_RANGE,
          "Sleep Quality": SummaryMetric.AVERAGE,
          "Pre-Market State": SummaryMetric.UNIQUE,
          "Post-Market State": SummaryMetric.UNIQUE,
          "Plan Adherence": SummaryMetric.AVERAGE,
          Distractions: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "This Month",
        icon: "icon:CalendarDays",
        position: 3,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.THIS_MONTH } as any],
        hiddenColumns: ["Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.DATE_RANGE,
          "Sleep Quality": SummaryMetric.AVERAGE,
          "Pre-Market State": SummaryMetric.UNIQUE,
          "Post-Market State": SummaryMetric.UNIQUE,
          "Plan Adherence": SummaryMetric.AVERAGE,
          Distractions: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "This Quarter",
        icon: "icon:ChartLine",
        position: 4,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        filters: [{ propertyName: "Date", operator: FilterOperator.ON_OR_AFTER, preset: DatePreset.THIS_QUARTER } as any],
        hiddenColumns: ["Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.DATE_RANGE,
          "Sleep Quality": SummaryMetric.AVERAGE,
          "Pre-Market State": SummaryMetric.UNIQUE,
          "Post-Market State": SummaryMetric.UNIQUE,
          "Plan Adherence": SummaryMetric.AVERAGE,
          Distractions: SummaryMetric.COUNT_FILLED,
        } as any,
      },
    ],
  },
  {
    name: "Notes",
    type: "notes",
    icon: "icon:StickyNote",
    isKey: true,
    sectionKey: "insight",
    seeds: seedsByDatabaseType["notes"],
    properties: notesProperties,
    applyDefaultTemplateToSeeds: true,
    templates: [
      {
        name: "Trading Insight",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-insight",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-insight",
                  width: 100,
                  children: [
                    {
                      id: "callout-insight",
                      type: "CALLOUT",
                      data: {
                        type: "info",
                        icon: "icon:Lightbulb",
                        title: "Key Insight",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-examples-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-examples-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-examples",
                      type: "HEADING",
                      data: { html: "Examples", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-examples-list",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-examples-list",
                  width: 100,
                  children: [
                    {
                      id: "list-examples",
                      type: "LIST",
                      data: {
                        listType: "numbered",
                        items: [{ id: "item-1", html: "" }],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-pitfalls",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-pitfalls",
                  width: 100,
                  children: [
                    {
                      id: "callout-pitfalls",
                      type: "CALLOUT",
                      data: {
                        type: "warning",
                        icon: "icon:TriangleAlert",
                        title: "Common Pitfalls",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        name: "Market Rule",
        isDefault: false,
        position: 1,
        content: {
          rows: [
            {
              id: "row-rule",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-rule",
                  width: 100,
                  children: [
                    {
                      id: "callout-rule",
                      type: "CALLOUT",
                      data: {
                        type: "info",
                        icon: "icon:ListChecks",
                        title: "Rule",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-criteria-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-criteria-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-criteria",
                      type: "HEADING",
                      data: { html: "Entry Criteria", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-criteria",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "item-1", text: "", checked: false },
                          { id: "item-2", text: "", checked: false },
                          { id: "item-3", text: "", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-4",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-4",
                  width: 100,
                  children: [{ id: "divider-4", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-exceptions-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-exceptions-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-exceptions",
                      type: "HEADING",
                      data: { html: "Exceptions", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-exceptions-list",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-exceptions-list",
                  width: 100,
                  children: [
                    {
                      id: "list-exceptions",
                      type: "LIST",
                      data: {
                        listType: "bullet",
                        items: [{ id: "item-1", html: "" }],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    views: [
      {
        name: "All Notes",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Status", "Confidence", "Market Regime", "Pair", "Trading Journal", "Mistakes", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Category: SummaryMetric.UNIQUE,
          Source: SummaryMetric.UNIQUE,
          Rating: SummaryMetric.AVERAGE,
          "Times Applied": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "Active Insights",
        icon: "icon:Zap",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Status", "Trading Journal", "Mistakes", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Category: SummaryMetric.UNIQUE,
          Confidence: SummaryMetric.UNIQUE,
          Source: SummaryMetric.UNIQUE,
          "Last Used": SummaryMetric.LATEST,
          "Times Applied": SummaryMetric.SUM,
          Rating: SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Rules",
        icon: "icon:ListChecks",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Category",
            operator: FilterOperator.CONTAINS,
            value: "Rules",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Category", "Source", "Trading Journal", "Mistakes", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Confidence: SummaryMetric.UNIQUE,
          "Market Regime": SummaryMetric.UNIQUE,
          Rating: SummaryMetric.AVERAGE,
        } as any,
        defaultTemplateName: "Market Rule",
      },
      {
        name: "By Category",
        icon: "icon:Tag",
        position: 3,
        recordLimit: 10,
        groupBy: "Category",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Trading Journal", "Mistakes", "Daily Routines", "Status"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Confidence: SummaryMetric.UNIQUE,
          "Times Applied": SummaryMetric.SUM,
          Rating: SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Archived",
        icon: "icon:Archive",
        position: 4,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Archived",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Status", "Confidence", "Market Regime", "Pair", "Trading Journal", "Mistakes", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          Category: SummaryMetric.UNIQUE,
        } as any,
      },
    ],
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Active",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Active",
          } as any,
        ],
        active: true,
      },
    ],
  },
  {
    name: "Mistakes",
    type: "mistakes",
    icon: "icon:TriangleAlert",
    isKey: true,
    sectionKey: "insight",
    seeds: seedsByDatabaseType["mistakes"],
    properties: mistakesProperties,
    applyDefaultTemplateToSeeds: true,
    templates: [
      {
        name: "Mistake Analysis",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-what-happened",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-what-happened",
                  width: 100,
                  children: [
                    {
                      id: "callout-what-happened",
                      type: "CALLOUT",
                      data: {
                        type: "danger",
                        icon: "icon:TriangleAlert",
                        title: "What Happened",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-root-cause-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-root-cause-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-root-cause",
                      type: "HEADING",
                      data: { html: "Root Cause", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-root-cause",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-root-cause",
                  width: 100,
                  children: [
                    {
                      id: "callout-root-cause",
                      type: "CALLOUT",
                      data: {
                        type: "warning",
                        icon: "icon:Search",
                        title: "Why It Happened",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-prevention-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-prevention-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-prevention",
                      type: "HEADING",
                      data: { html: "Prevention Plan", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-prevention-list",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-prevention-list",
                  width: 100,
                  children: [
                    {
                      id: "list-prevention",
                      type: "LIST",
                      data: {
                        listType: "numbered",
                        items: [
                          { id: "item-1", html: "" },
                          { id: "item-2", html: "" },
                          { id: "item-3", html: "" },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-resolution",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-resolution",
                  width: 100,
                  children: [
                    {
                      id: "callout-resolution",
                      type: "CALLOUT",
                      data: {
                        type: "success",
                        icon: "icon:CheckCircle2",
                        title: "Resolution Criteria",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Active",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Active",
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Resolved Date",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Resolved" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Resolved Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "All Mistakes",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Trigger", "Prevention Rule", "Resolved Date", "Last Used", "Trading Journal", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          Severity: SummaryMetric.UNIQUE,
          Date: SummaryMetric.LATEST,
          "Total Cost": SummaryMetric.SUM,
          "Recurrence Count": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "Active Mistakes",
        icon: "icon:Flame",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Resolved Date", "Trading Journal", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          Severity: SummaryMetric.UNIQUE,
          Date: SummaryMetric.LATEST,
          "Total Cost": SummaryMetric.SUM,
          "Last Used": SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "Resolved",
        icon: "icon:CheckCircle2",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Resolved",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Trigger", "Prevention Rule", "Last Used", "Trading Journal", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          "Resolved Date": SummaryMetric.LATEST,
          "Total Cost": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "By Category",
        icon: "icon:Tag",
        position: 3,
        recordLimit: 10,
        groupBy: "Category",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Trigger", "Prevention Rule", "Resolved Date", "Last Used", "Trading Journal", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Severity: SummaryMetric.UNIQUE,
          "Total Cost": SummaryMetric.SUM,
          "Recurrence Count": SummaryMetric.SUM,
          Date: SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "High Severity",
        icon: "icon:AlertOctagon",
        position: 4,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Severity",
            operator: FilterOperator.EQUALS,
            value: "High",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Last Used", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Resolved Date", "Trading Journal", "Daily Routines"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          "Total Cost": SummaryMetric.SUM,
          "Last Used": SummaryMetric.LATEST,
          "Recurrence Count": SummaryMetric.SUM,
        } as any,
      },
    ],
  },
  {
    name: "Performance Review",
    type: "performance-review",
    icon: "icon:ChartLine",
    sectionKey: "insight",
    seeds: seedsByDatabaseType["performance-review"],
    properties: performanceReviewProperties,
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-fill Period End",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Period End",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Grade F → Mistakes",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Grade",
          condition: { type: "equals", value: "F" },
        },
        actions: [
          {
            type: AutomationActionType.CREATE_RECORD,
            sourceDatabaseType: "mistakes",
            fieldMappings: [
              { targetPropertyName: "Name", valueType: ValueType.FIXED, value: "Failed Performance Review Period" },
              { targetPropertyName: "Category", valueType: ValueType.FIXED, value: "Psychology" },
              { targetPropertyName: "Impact Type", valueType: ValueType.FIXED, value: "Financial Loss" },
              { targetPropertyName: "Date", valueType: ValueType.TODAY },
            ],
          } as any,
        ],
        active: true,
      },
    ],
    templates: [
      {
        name: "Weekly Review",
        namePattern: "Week {{this-week}}",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-wr-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-heading",
                  width: 100,
                  children: [{ id: "heading-wr-overview", type: "HEADING", data: { html: "Weekly Overview", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-callout",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-callout",
                  width: 100,
                  children: [
                    {
                      id: "callout-wr-summary",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:TrendingUp", title: "Week in Numbers", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-divider-1",
              paddingBottom: 24,
              columns: [{ id: "col-wr-divider-1", width: 100, children: [{ id: "divider-wr-1", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-wr-trades-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-trades-heading",
                  width: 100,
                  children: [{ id: "heading-wr-trades", type: "HEADING", data: { html: "Trade Performance", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-chart-trades",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-chart-trades",
                  width: 50,
                  children: [
                    {
                      id: "chart-wr-equity",
                      type: "CHART",
                      data: {
                        chartType: "line",
                        title: "Equity Curve (Cumulative R)",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Entry Date",
                          yField: "Actual R",
                          aggregate: "cumulative-sum",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-wr-chart-outcome",
                  width: 50,
                  children: [
                    {
                      id: "chart-wr-outcome",
                      type: "CHART",
                      data: {
                        chartType: "bar",
                        title: "P&L by Outcome",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Outcome",
                          yField: "Net P&L",
                          groupBy: "Outcome",
                          aggregate: "sum",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-chart-additional",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-chart-pair",
                  width: 50,
                  children: [
                    {
                      id: "chart-wr-pair",
                      type: "CHART",
                      data: {
                        chartType: "pie",
                        title: "Trades by Pair",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Pair",
                          yField: "Name",
                          groupBy: "Pair",
                          aggregate: "count",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-wr-chart-session",
                  width: 50,
                  children: [
                    {
                      id: "chart-wr-session",
                      type: "CHART",
                      data: {
                        chartType: "area",
                        title: "Win Rate by Session",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Session / Time",
                          yField: "Is Win",
                          groupBy: "Session / Time",
                          aggregate: "avg",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-divider-2",
              paddingBottom: 24,
              columns: [{ id: "col-wr-divider-2", width: 100, children: [{ id: "divider-wr-2", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-wr-scores-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-scores-heading",
                  width: 100,
                  children: [{ id: "heading-wr-scores", type: "HEADING", data: { html: "Self-Assessment", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-scores",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-discipline",
                  width: 33,
                  children: [
                    {
                      id: "callout-wr-discipline",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:Target", title: "Discipline", html: "" },
                    },
                  ],
                },
                {
                  id: "col-wr-psychology",
                  width: 33,
                  children: [
                    {
                      id: "callout-wr-psychology",
                      type: "CALLOUT",
                      data: { type: "warning", icon: "icon:Brain", title: "Psychology", html: "" },
                    },
                  ],
                },
                {
                  id: "col-wr-process",
                  width: 34,
                  children: [
                    {
                      id: "callout-wr-process",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:CheckCircle", title: "Process", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-divider-3",
              paddingBottom: 24,
              columns: [{ id: "col-wr-divider-3", width: 100, children: [{ id: "divider-wr-3", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-wr-wins-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-wins-heading",
                  width: 100,
                  children: [{ id: "heading-wr-wins", type: "HEADING", data: { html: "Wins & Losses", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-wins",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-wins",
                  width: 50,
                  children: [
                    {
                      id: "callout-wr-wins",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:TrendingUp", title: "What Went Well", html: "" },
                    },
                  ],
                },
                {
                  id: "col-wr-losses",
                  width: 50,
                  children: [
                    {
                      id: "callout-wr-losses",
                      type: "CALLOUT",
                      data: { type: "danger", icon: "icon:TrendingDown", title: "What Went Wrong", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-divider-4",
              paddingBottom: 24,
              columns: [{ id: "col-wr-divider-4", width: 100, children: [{ id: "divider-wr-4", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-wr-lessons-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-lessons-heading",
                  width: 100,
                  children: [{ id: "heading-wr-lessons", type: "HEADING", data: { html: "Key Lessons", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-lessons",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-wr-lessons",
                  width: 100,
                  children: [
                    {
                      id: "list-wr-lessons",
                      type: "LIST",
                      data: {
                        listType: "numbered",
                        items: [{ id: "lesson-1", html: "" }],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-wr-focus-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-wr-focus-heading",
                  width: 100,
                  children: [{ id: "heading-wr-focus", type: "HEADING", data: { html: "Focus for Next Week", level: 2 } }],
                },
              ],
            },
            {
              id: "row-wr-focus",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-wr-focus",
                  width: 100,
                  children: [
                    {
                      id: "callout-wr-focus",
                      type: "CALLOUT",
                      data: { type: "custom", icon: "icon:Crosshair", title: "Top Priority", html: "", color: "#2563EB" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        name: "Monthly Review",
        namePattern: "{{month}} Review",
        isDefault: false,
        position: 1,
        content: {
          rows: [
            {
              id: "row-mr-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-heading",
                  width: 100,
                  children: [{ id: "heading-mr-overview", type: "HEADING", data: { html: "Monthly Overview", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-callout",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-callout",
                  width: 100,
                  children: [
                    {
                      id: "callout-mr-summary",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:BarChart2", title: "Month in Numbers", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-divider-1",
              paddingBottom: 24,
              columns: [{ id: "col-mr-divider-1", width: 100, children: [{ id: "divider-mr-1", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-mr-charts-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-charts-heading",
                  width: 100,
                  children: [{ id: "heading-mr-charts", type: "HEADING", data: { html: "Performance Charts", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-equity-chart",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-mr-equity-chart",
                  width: 100,
                  children: [
                    {
                      id: "chart-mr-equity",
                      type: "CHART",
                      data: {
                        chartType: "line",
                        title: "Monthly Equity Curve (Cumulative R)",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Entry Date",
                          yField: "Actual R",
                          aggregate: "cumulative-sum",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-pair-charts",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-pair-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-mr-pair",
                      type: "CHART",
                      data: {
                        chartType: "pie",
                        title: "P&L by Pair",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Pair",
                          yField: "Net P&L",
                          groupBy: "Pair",
                          aggregate: "sum",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-mr-session-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-mr-session",
                      type: "CHART",
                      data: {
                        chartType: "bar",
                        title: "Avg R by Session",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Session / Time",
                          yField: "Actual R",
                          groupBy: "Session / Time",
                          aggregate: "avg",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-divider-2",
              paddingBottom: 24,
              columns: [{ id: "col-mr-divider-2", width: 100, children: [{ id: "divider-mr-2", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-mr-weekly-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-weekly-heading",
                  width: 100,
                  children: [{ id: "heading-mr-weekly", type: "HEADING", data: { html: "Weekly Breakdown", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-weekly-db",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-weekly-db",
                  width: 100,
                  children: [
                    {
                      id: "linked-db-mr-weekly",
                      type: "LINKED_DATABASE",
                      data: {
                        databaseId: "$current",
                        databaseName: "Performance Review",
                        viewName: "Weekly Reviews",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-divider-3",
              paddingBottom: 24,
              columns: [{ id: "col-mr-divider-3", width: 100, children: [{ id: "divider-mr-3", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-mr-scores-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-scores-heading",
                  width: 100,
                  children: [{ id: "heading-mr-scores", type: "HEADING", data: { html: "Monthly Self-Assessment", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-scores",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-discipline",
                  width: 33,
                  children: [
                    {
                      id: "callout-mr-discipline",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:Target", title: "Discipline", html: "" },
                    },
                  ],
                },
                {
                  id: "col-mr-psychology",
                  width: 33,
                  children: [
                    {
                      id: "callout-mr-psychology",
                      type: "CALLOUT",
                      data: { type: "warning", icon: "icon:Brain", title: "Psychology", html: "" },
                    },
                  ],
                },
                {
                  id: "col-mr-process",
                  width: 34,
                  children: [
                    {
                      id: "callout-mr-process",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:CheckCircle", title: "Process", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-divider-4",
              paddingBottom: 24,
              columns: [{ id: "col-mr-divider-4", width: 100, children: [{ id: "divider-mr-4", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-mr-lessons-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-lessons-heading",
                  width: 100,
                  children: [{ id: "heading-mr-lessons", type: "HEADING", data: { html: "Key Takeaways", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-wins",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-wins",
                  width: 50,
                  children: [
                    {
                      id: "callout-mr-wins",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:TrendingUp", title: "Key Win This Month", html: "" },
                    },
                  ],
                },
                {
                  id: "col-mr-losses",
                  width: 50,
                  children: [
                    {
                      id: "callout-mr-losses",
                      type: "CALLOUT",
                      data: { type: "danger", icon: "icon:TrendingDown", title: "Biggest Mistake", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-lessons",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-mr-lessons",
                  width: 100,
                  children: [
                    {
                      id: "list-mr-lessons",
                      type: "LIST",
                      data: {
                        listType: "numbered",
                        items: [{ id: "mr-lesson-1", html: "" }],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-mr-next-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-mr-next-heading",
                  width: 100,
                  children: [{ id: "heading-mr-next", type: "HEADING", data: { html: "Goals for Next Month", level: 2 } }],
                },
              ],
            },
            {
              id: "row-mr-goals",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-mr-goals",
                  width: 100,
                  children: [
                    {
                      id: "checklist-mr-goals",
                      type: "CHECKLIST",
                      data: {
                        showProgress: true,
                        items: [
                          { id: "mr-goal-1", text: "", checked: false },
                          { id: "mr-goal-2", text: "", checked: false },
                          { id: "mr-goal-3", text: "", checked: false },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        name: "Quarterly Review",
        namePattern: "{{quarter}} Review",
        isDefault: false,
        position: 2,
        content: {
          rows: [
            {
              id: "row-qr-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-qr-heading",
                  width: 100,
                  children: [{ id: "heading-qr-overview", type: "HEADING", data: { html: "Quarterly Overview", level: 2 } }],
                },
              ],
            },
            {
              id: "row-qr-callout",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-qr-callout",
                  width: 100,
                  children: [
                    {
                      id: "callout-qr-summary",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:ChartLine", title: "Quarter in Numbers", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-qr-divider-1",
              paddingBottom: 24,
              columns: [{ id: "col-qr-divider-1", width: 100, children: [{ id: "divider-qr-1", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-qr-charts-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-qr-charts-heading",
                  width: 100,
                  children: [{ id: "heading-qr-charts", type: "HEADING", data: { html: "Quarterly Performance", level: 2 } }],
                },
              ],
            },
            {
              id: "row-qr-equity-chart",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-qr-equity-chart",
                  width: 100,
                  children: [
                    {
                      id: "chart-qr-equity",
                      type: "CHART",
                      data: {
                        chartType: "line",
                        title: "Quarterly Equity Curve",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Entry Date",
                          yField: "Actual R",
                          aggregate: "cumulative-sum",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-qr-score-chart",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-qr-score-chart",
                  width: 100,
                  children: [
                    {
                      id: "chart-qr-scores",
                      type: "CHART",
                      data: {
                        chartType: "radar",
                        title: "Quarterly Scores",
                        source: {
                          type: "record-properties",
                          fields: ["Discipline Score", "Psychology Score", "Process Score"],
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-qr-divider-2",
              paddingBottom: 24,
              columns: [{ id: "col-qr-divider-2", width: 100, children: [{ id: "divider-qr-2", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-qr-monthly-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-qr-monthly-heading",
                  width: 100,
                  children: [{ id: "heading-qr-monthly", type: "HEADING", data: { html: "Monthly Breakdown", level: 2 } }],
                },
              ],
            },
            {
              id: "row-qr-monthly-db",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-qr-monthly-db",
                  width: 100,
                  children: [
                    {
                      id: "linked-db-qr-monthly",
                      type: "LINKED_DATABASE",
                      data: {
                        databaseId: "$current",
                        databaseName: "Performance Review",
                        viewName: "Monthly Reviews",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-qr-divider-3",
              paddingBottom: 24,
              columns: [{ id: "col-qr-divider-3", width: 100, children: [{ id: "divider-qr-3", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-qr-goals-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-qr-goals-heading",
                  width: 100,
                  children: [{ id: "heading-qr-goals", type: "HEADING", data: { html: "Quarter Goals Review", level: 2 } }],
                },
              ],
            },
            {
              id: "row-qr-goals",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-qr-goals-achieved",
                  width: 50,
                  children: [
                    {
                      id: "callout-qr-achieved",
                      type: "CALLOUT",
                      data: { type: "success", icon: "icon:Trophy", title: "Goals Achieved", html: "" },
                    },
                  ],
                },
                {
                  id: "col-qr-goals-missed",
                  width: 50,
                  children: [
                    {
                      id: "callout-qr-missed",
                      type: "CALLOUT",
                      data: { type: "danger", icon: "icon:X", title: "Goals Missed", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-qr-focus-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-qr-focus-heading",
                  width: 100,
                  children: [{ id: "heading-qr-focus", type: "HEADING", data: { html: "Next Quarter Focus", level: 2 } }],
                },
              ],
            },
            {
              id: "row-qr-focus",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-qr-focus",
                  width: 100,
                  children: [
                    {
                      id: "checklist-qr-focus",
                      type: "CHECKLIST",
                      data: {
                        showProgress: true,
                        items: [
                          { id: "qr-goal-1", text: "", checked: false },
                          { id: "qr-goal-2", text: "", checked: false },
                          { id: "qr-goal-3", text: "", checked: false },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    views: [
      {
        name: "All Reviews",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Period Start", "Period End", "Trades", "Mistakes", "Daily Routines", "Trading Systems", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          "Net P&L": SummaryMetric.SUM,
          "Gross P&L": SummaryMetric.SUM,
          "Total R": SummaryMetric.SUM,
          "Avg R": SummaryMetric.AVERAGE,
          "Trade Count": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Profit Factor": SummaryMetric.AVERAGE,
          Grade: SummaryMetric.UNIQUE,
        } as any,
      },
      {
        name: "Weekly Reviews",
        icon: "icon:Calendar",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Period",
            operator: FilterOperator.EQUALS,
            value: "Weekly",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Period", "Period End", "Trades", "Mistakes", "Daily Routines", "Trading Systems", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          "Net P&L": SummaryMetric.SUM,
          "Total R": SummaryMetric.SUM,
          "Avg R": SummaryMetric.AVERAGE,
          "Trade Count": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Discipline Score": SummaryMetric.AVERAGE,
          "Psychology Score": SummaryMetric.AVERAGE,
          "Process Score": SummaryMetric.AVERAGE,
        } as any,
        defaultTemplateName: "Weekly Review",
      },
      {
        name: "Monthly Reviews",
        icon: "icon:CalendarDays",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Period",
            operator: FilterOperator.EQUALS,
            value: "Monthly",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Period", "Trades", "Mistakes", "Daily Routines", "Trading Systems", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          "Net P&L": SummaryMetric.SUM,
          "Total R": SummaryMetric.SUM,
          "Avg R": SummaryMetric.AVERAGE,
          "Trade Count": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Profit Factor": SummaryMetric.AVERAGE,
          Grade: SummaryMetric.UNIQUE,
        } as any,
        defaultTemplateName: "Monthly Review",
      },
      {
        name: "Quarterly Reviews",
        icon: "icon:CalendarRange",
        position: 3,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Period",
            operator: FilterOperator.EQUALS,
            value: "Quarterly",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Period", "Trades", "Mistakes", "Daily Routines", "Trading Systems", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Date: SummaryMetric.LATEST,
          "Net P&L": SummaryMetric.SUM,
          "Total R": SummaryMetric.SUM,
          "Avg R": SummaryMetric.AVERAGE,
          "Trade Count": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Profit Factor": SummaryMetric.AVERAGE,
          "Discipline Score": SummaryMetric.AVERAGE,
          "Psychology Score": SummaryMetric.AVERAGE,
          "Process Score": SummaryMetric.AVERAGE,
          Grade: SummaryMetric.UNIQUE,
        } as any,
        defaultTemplateName: "Quarterly Review",
      },
      {
        name: "By Grade",
        icon: "icon:Star",
        position: 4,
        recordLimit: 10,
        groupBy: "Grade",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Grade",
          "Period",
          "Period Start",
          "Period End",
          "Trades",
          "Mistakes",
          "Daily Routines",
          "Trading Systems",
          "Notes",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Net P&L": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Total R": SummaryMetric.SUM,
          "Avg R": SummaryMetric.AVERAGE,
        } as any,
      },
    ],
  },
  {
    name: "Accounts",
    type: "accounts",
    icon: "icon:Wallet",
    isKey: true,
    sectionKey: "settings",
    seeds: seedsByDatabaseType["accounts"],
    properties: accountsProperties,
    templates: [
      {
        name: "Account Summary",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-overview-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-overview-heading",
                  width: 100,
                  children: [{ id: "heading-overview", type: "HEADING", data: { html: "Account Overview", level: 2 } }],
                },
              ],
            },
            {
              id: "row-overview-callout",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-overview-callout",
                  width: 100,
                  children: [
                    {
                      id: "callout-overview",
                      type: "CALLOUT",
                      data: { type: "info", icon: "icon:Wallet", title: "Account Details", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [{ id: "col-divider-1", width: 100, children: [{ id: "divider-1", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-risk-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-risk-heading",
                  width: 100,
                  children: [{ id: "heading-risk", type: "HEADING", data: { html: "Risk Parameters", level: 2 } }],
                },
              ],
            },
            {
              id: "row-risk-cols",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-risk-limits",
                  width: 50,
                  children: [
                    {
                      id: "callout-risk",
                      type: "CALLOUT",
                      data: { type: "warning", icon: "icon:ShieldAlert", title: "Key Limits", html: "" },
                    },
                  ],
                },
                {
                  id: "col-risk-rules",
                  width: 50,
                  children: [
                    {
                      id: "callout-rules",
                      type: "CALLOUT",
                      data: { type: "danger", icon: "icon:Ban", title: "Forbidden Actions", html: "" },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [{ id: "col-divider-2", width: 100, children: [{ id: "divider-2", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-compliance-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-compliance-heading",
                  width: 100,
                  children: [{ id: "heading-compliance", type: "HEADING", data: { html: "Compliance Checklist", level: 2 } }],
                },
              ],
            },
            {
              id: "row-compliance-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-compliance-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-compliance",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "c-1", text: "Daily loss limit set and respected", checked: false },
                          { id: "c-2", text: "Max position size configured on platform", checked: false },
                          { id: "c-3", text: "Hard stop-loss placed on every trade", checked: false },
                          { id: "c-4", text: "News trading rule applied correctly", checked: false },
                          { id: "c-5", text: "Minimum trading days on track (prop only)", checked: false },
                          { id: "c-6", text: "Profit target progress checked weekly (prop only)", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [{ id: "col-divider-3", width: 100, children: [{ id: "divider-3", type: "DIVIDER", data: {} }] }],
            },
            {
              id: "row-notes-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-notes-heading",
                  width: 100,
                  children: [{ id: "heading-notes", type: "HEADING", data: { html: "Notes", level: 2 } }],
                },
              ],
            },
            {
              id: "row-notes",
              paddingBottom: 0,
              columns: [{ id: "col-notes", width: 100, children: [{ id: "text-notes", type: "TEXT", data: { html: "" } }] }],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-set Active",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Active",
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-fill Start Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Start Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set End Date on Close",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Closed" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "End Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set End Date on Fail",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Failed" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "End Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "All Accounts",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Start Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Account ID",
          "Start Date",
          "End Date",
          "Max Overall Drawdown",
          "Daily Loss Limit",
          "Max Position Size",
          "Max Open Trades",
          "News Trading",
          "Weekend Holding",
          "Hard Stop Loss",
          "Operations",
          "Trades",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Account Type": SummaryMetric.UNIQUE,
          Currency: SummaryMetric.UNIQUE,
          "Starting Balance": SummaryMetric.SUM,
          Status: SummaryMetric.UNIQUE,
          Trades: SummaryMetric.COUNT_FILLED,
        } as any,
      },
      {
        name: "Active Accounts",
        icon: "icon:ShieldCheck",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Start Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Account ID", "End Date", "Operations", "Trades"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Account Type": SummaryMetric.UNIQUE,
          Currency: SummaryMetric.UNIQUE,
          "Starting Balance": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "Prop Firms",
        icon: "icon:Building",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Account Type",
            operator: FilterOperator.EQUALS,
            value: "Prop Firm",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Start Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Account ID", "Broker", "Platform", "Leverage", "Operations", "Trades"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Provider: SummaryMetric.UNIQUE,
          Phase: SummaryMetric.UNIQUE,
          "Profit Target": SummaryMetric.AVERAGE,
          "Challenge Fee": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "Demo Accounts",
        icon: "icon:FlaskConical",
        position: 3,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Account Type",
            operator: FilterOperator.EQUALS,
            value: "Demo",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Start Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Account ID",
          "Provider",
          "Phase",
          "Profit Target",
          "Consistency Rule",
          "Min Trading Days",
          "Profit Split",
          "Challenge Fee",
          "Operations",
          "Trades",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Broker: SummaryMetric.UNIQUE,
          Platform: SummaryMetric.UNIQUE,
          "Starting Balance": SummaryMetric.SUM,
        } as any,
      },
      {
        name: "Closed",
        icon: "icon:Archive",
        position: 4,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.NOT_EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "End Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Account ID", "Start Date", "Operations", "Trades"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Account Type": SummaryMetric.UNIQUE,
          Status: SummaryMetric.UNIQUE,
          "End Date": SummaryMetric.LATEST,
          "Starting Balance": SummaryMetric.SUM,
        } as any,
      },
    ],
  },
  {
    name: "Operations",
    type: "operations",
    icon: "icon:ArrowLeftRight",
    isKey: true,
    sectionKey: "settings",
    seeds: seedsByDatabaseType["operations"],
    properties: operationsProperties,
    templates: [
      {
        name: "Default",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-details",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-details",
                  width: 100,
                  children: [
                    {
                      id: "callout-details",
                      type: "CALLOUT",
                      data: {
                        type: "info",
                        icon: "icon:Receipt",
                        title: "Transaction Details",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-notes-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-notes-heading",
                  width: 100,
                  children: [{ id: "heading-notes", type: "HEADING", data: { html: "Notes", level: 2 } }],
                },
              ],
            },
            {
              id: "row-notes",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-notes",
                  width: 100,
                  children: [{ id: "text-notes", type: "TEXT", data: { html: "" } }],
                },
              ],
            },
          ],
        },
      },
      {
        name: "Withdrawal Request",
        isDefault: false,
        position: 1,
        content: {
          rows: [
            {
              id: "row-requirements",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-requirements",
                  width: 100,
                  children: [
                    {
                      id: "callout-requirements",
                      type: "CALLOUT",
                      data: {
                        type: "warning",
                        icon: "icon:FileCheck",
                        title: "Withdrawal Requirements",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-requirements",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "item-1", text: "Minimum trading days completed", checked: false },
                          { id: "item-2", text: "Profit target reached", checked: false },
                          { id: "item-3", text: "No open positions", checked: false },
                          { id: "item-4", text: "KYC / verification complete", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-updates-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-updates-heading",
                  width: 100,
                  children: [{ id: "heading-updates", type: "HEADING", data: { html: "Status Updates", level: 2 } }],
                },
              ],
            },
            {
              id: "row-updates-list",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-updates-list",
                  width: 100,
                  children: [
                    {
                      id: "list-updates",
                      type: "LIST",
                      data: {
                        listType: "bullet",
                        items: [{ id: "item-1", html: "" }],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-timeline",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-timeline",
                  width: 100,
                  children: [
                    {
                      id: "callout-timeline",
                      type: "CALLOUT",
                      data: {
                        type: "info",
                        icon: "icon:Clock",
                        title: "Expected Timeline",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
    automations: [
      {
        name: "Auto-fill Date",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Pending",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Pending",
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-set Settlement Date",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Completed" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Settlement Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
    ],
    views: [
      {
        name: "All Operations",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Settlement Date", "Reference", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Amount: SummaryMetric.SUM,
          Fee: SummaryMetric.SUM,
          "Net Amount": SummaryMetric.SUM,
          Account: SummaryMetric.UNIQUE,
          Date: SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "Pending",
        icon: "icon:Clock",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Pending",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.ASC } as any],
        hiddenColumns: ["Settlement Date", "Reference", "Notes", "Status"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Amount: SummaryMetric.SUM,
          Account: SummaryMetric.UNIQUE,
          Date: SummaryMetric.EARLIEST,
        } as any,
      },
      {
        name: "Deposits",
        icon: "icon:ArrowDownToLine",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Type",
            operator: FilterOperator.EQUALS,
            value: "Deposit",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Settlement Date", "Reference", "Notes", "Type", "Fee"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Amount: SummaryMetric.SUM,
          "Net Amount": SummaryMetric.SUM,
          Account: SummaryMetric.UNIQUE,
          Date: SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "Withdrawals",
        icon: "icon:ArrowUpFromLine",
        position: 3,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Type",
            operator: FilterOperator.EQUALS,
            value: "Withdrawal",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Reference", "Notes", "Type"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Amount: SummaryMetric.SUM,
          Fee: SummaryMetric.SUM,
          "Net Amount": SummaryMetric.SUM,
          Account: SummaryMetric.UNIQUE,
          Date: SummaryMetric.LATEST,
        } as any,
      },
      {
        name: "By Account",
        icon: "icon:Wallet",
        position: 4,
        recordLimit: 10,
        groupBy: "Account",
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: ["Account", "Settlement Date", "Reference", "Notes"],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Amount: SummaryMetric.SUM,
          Fee: SummaryMetric.SUM,
          "Net Amount": SummaryMetric.SUM,
          Date: SummaryMetric.LATEST,
        } as any,
      },
    ],
  },
  {
    name: "Trading Systems",
    type: "trading-system",
    icon: "icon:Target",
    sectionKey: "settings",
    seeds: seedsByDatabaseType["trading-system"],
    properties: tradingSystemProperties,
    applyDefaultTemplateToSeeds: true,
    automations: [
      {
        name: "Auto-set Testing",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Status",
            valueType: ValueType.FIXED,
            value: "Testing",
          } as any,
        ],
        active: true,
      },
      {
        name: "Auto-fill Created",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Date",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Active → Update Last Updated",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Active" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Last Updated",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Paused → Update Last Updated",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Paused" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Last Updated",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
      {
        name: "Retired → Update Last Updated",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyName: "Status",
          condition: { type: "equals", value: "Retired" },
        },
        actions: [
          {
            type: AutomationActionType.SET_FIELD_VALUE,
            propertyName: "Last Updated",
            valueType: ValueType.TODAY,
          } as any,
        ],
        active: true,
      },
    ],
    templates: [
      {
        name: "System Overview",
        isDefault: true,
        position: 0,
        content: {
          rows: [
            {
              id: "row-edge",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-edge",
                  width: 100,
                  children: [
                    {
                      id: "callout-edge",
                      type: "CALLOUT",
                      data: {
                        type: "info",
                        icon: "icon:Lightbulb",
                        title: "Edge & Theory",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-1",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-1",
                  width: 100,
                  children: [{ id: "divider-1", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-entry-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-entry-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-entry",
                      type: "HEADING",
                      data: { html: "Entry Criteria", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-entry-checklist",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-entry-checklist",
                  width: 100,
                  children: [
                    {
                      id: "checklist-entry",
                      type: "CHECKLIST",
                      data: {
                        items: [
                          { id: "item-1", text: "", checked: false },
                          { id: "item-2", text: "", checked: false },
                          { id: "item-3", text: "", checked: false },
                          { id: "item-4", text: "", checked: false },
                        ],
                        showProgress: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-exit-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-exit-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-exit",
                      type: "HEADING",
                      data: { html: "Exit Rules", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-exit-list",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-exit-list",
                  width: 100,
                  children: [
                    {
                      id: "list-exit",
                      type: "LIST",
                      data: {
                        listType: "bullet",
                        items: [
                          { id: "item-1", html: "" },
                          { id: "item-2", html: "" },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-2",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-2",
                  width: 100,
                  children: [{ id: "divider-2", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-risk-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-risk-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-risk",
                      type: "HEADING",
                      data: { html: "Risk Management", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-risk-callout",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-risk-callout",
                  width: 100,
                  children: [
                    {
                      id: "callout-risk",
                      type: "CALLOUT",
                      data: {
                        type: "warning",
                        icon: "icon:ShieldAlert",
                        title: "Key Rules",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-risk-table",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-risk-table",
                  width: 100,
                  children: [
                    {
                      id: "table-risk-parameters",
                      type: "TABLE",
                      data: {
                        headers: ["Parameter", "Limit Value", "Consequence of Violation"],
                        rows: [
                          ["Daily Loss Limit", "2% of balance", "Terminal locked & session closed"],
                          ["Max Position Size", "5.0 lots maximum", "Immediate trade reduction"],
                          ["Max Open Trades", "2 simultaneous positions", "Order rejection by EA"],
                          ["Weekend Holding", "Restricted (unless swing)", "Manual closure before NY close"],
                        ],
                        highlightFirstRow: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-3",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-3",
                  width: 100,
                  children: [{ id: "divider-3", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-conditions-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-conditions-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-conditions",
                      type: "HEADING",
                      data: { html: "Best Conditions", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-conditions",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-when-trade",
                  width: 50,
                  children: [
                    {
                      id: "callout-when-trade",
                      type: "CALLOUT",
                      data: {
                        type: "success",
                        icon: "icon:CheckCircle2",
                        title: "When to Trade",
                        html: "",
                      },
                    },
                  ],
                },
                {
                  id: "col-when-avoid",
                  width: 50,
                  children: [
                    {
                      id: "callout-when-avoid",
                      type: "CALLOUT",
                      data: {
                        type: "danger",
                        icon: "icon:Ban",
                        title: "When to Avoid",
                        html: "",
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-4",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-4",
                  width: 100,
                  children: [{ id: "divider-4", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-ts-perf-charts-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-ts-perf-charts-heading",
                  width: 100,
                  children: [{ id: "heading-ts-perf-charts", type: "HEADING", data: { html: "Live Performance", level: 2 } }],
                },
              ],
            },
            {
              id: "row-ts-equity-chart",
              paddingBottom: 16,
              columns: [
                {
                  id: "col-ts-equity-chart",
                  width: 100,
                  children: [
                    {
                      id: "chart-ts-equity",
                      type: "CHART",
                      data: {
                        chartType: "line",
                        title: "Equity Curve (Cumulative R)",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Entry Date",
                          yField: "Actual R",
                          aggregate: "cumulative-sum",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-ts-breakdown-charts",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-ts-pair-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-ts-pair",
                      type: "CHART",
                      data: {
                        chartType: "bar",
                        title: "Net P&L by Pair",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Pair",
                          yField: "Net P&L",
                          groupBy: "Pair",
                          aggregate: "sum",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-ts-outcome-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-ts-outcome",
                      type: "CHART",
                      data: {
                        chartType: "pie",
                        title: "Trade Distribution by Outcome",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Outcome",
                          yField: "Name",
                          groupBy: "Outcome",
                          aggregate: "count",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-ts-session-chart",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-ts-session-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-ts-session",
                      type: "CHART",
                      data: {
                        chartType: "area",
                        title: "Avg R by Session",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Session / Time",
                          yField: "Actual R",
                          groupBy: "Session / Time",
                          aggregate: "avg",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "col-ts-model-chart",
                  width: 50,
                  children: [
                    {
                      id: "chart-ts-model",
                      type: "CHART",
                      data: {
                        chartType: "bar",
                        title: "Trades by Entry Model",
                        source: {
                          type: "relation",
                          relationField: "Trades",
                          xField: "Entry Model",
                          yField: "Name",
                          groupBy: "Entry Model",
                          aggregate: "count",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-divider-5",
              paddingBottom: 24,
              columns: [
                {
                  id: "col-divider-5",
                  width: 100,
                  children: [{ id: "divider-5", type: "DIVIDER", data: {} }],
                },
              ],
            },
            {
              id: "row-performance-heading",
              paddingBottom: 8,
              columns: [
                {
                  id: "col-performance-heading",
                  width: 100,
                  children: [
                    {
                      id: "heading-performance",
                      type: "HEADING",
                      data: { html: "Performance Notes", level: 2 },
                    },
                  ],
                },
              ],
            },
            {
              id: "row-performance-text",
              paddingBottom: 0,
              columns: [
                {
                  id: "col-performance-text",
                  width: 100,
                  children: [{ id: "text-performance", type: "TEXT", data: { html: "" } }],
                },
              ],
            },
          ],
        },
      },
    ],
    views: [
      {
        name: "All Systems",
        icon: "icon:LayoutList",
        position: 0,
        recordLimit: 10,
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Date",
          "Market Type",
          "Pairs",
          "Timeframes",
          "Sessions",
          "Risk Per Trade %",
          "Max Daily Loss %",
          "Max Simultaneous Trades",
          "Min Sample Size",
          "Trades",
          "Total R",
          "Confidence",
          "Last Updated",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Status: SummaryMetric.UNIQUE,
          Category: SummaryMetric.UNIQUE,
          "Total Trades": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Avg R": SummaryMetric.AVERAGE,
          "Profit Factor": SummaryMetric.AVERAGE,
          Expectancy: SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Active",
        icon: "icon:ShieldCheck",
        position: 1,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Active",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Name", direction: SortDirection.ASC } as any],
        hiddenColumns: [
          "Status",
          "Market Type",
          "Sessions",
          "Max Daily Loss %",
          "Max Simultaneous Trades",
          "Min Sample Size",
          "Trades",
          "Total R",
          "Profit Factor",
          "Expectancy",
          "Confidence",
          "Last Updated",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          Pairs: SummaryMetric.UNIQUE,
          "Total Trades": SummaryMetric.SUM,
          "Win Rate": SummaryMetric.AVERAGE,
          "Avg R": SummaryMetric.AVERAGE,
          "Risk Per Trade %": SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Testing",
        icon: "icon:FlaskConical",
        position: 2,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Testing",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Date", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Status",
          "Max Daily Loss %",
          "Max Simultaneous Trades",
          "Trades",
          "Total R",
          "Avg R",
          "Profit Factor",
          "Expectancy",
          "Last Updated",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Category: SummaryMetric.UNIQUE,
          "Total Trades": SummaryMetric.SUM,
          "Min Sample Size": SummaryMetric.AVERAGE,
          "Win Rate": SummaryMetric.AVERAGE,
          Confidence: SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "By Category",
        icon: "icon:Tag",
        position: 3,
        recordLimit: 10,
        groupBy: "Category",
        sort: [{ field: SortField.PROPERTY, propertyName: "Name", direction: SortDirection.ASC } as any],
        hiddenColumns: [
          "Category",
          "Date",
          "Status",
          "Market Type",
          "Pairs",
          "Timeframes",
          "Sessions",
          "Risk Per Trade %",
          "Max Daily Loss %",
          "Max Simultaneous Trades",
          "Min Sample Size",
          "Trades",
          "Confidence",
          "Last Updated",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          "Win Rate": SummaryMetric.AVERAGE,
          "Avg R": SummaryMetric.AVERAGE,
          "Total R": SummaryMetric.SUM,
          "Profit Factor": SummaryMetric.AVERAGE,
        } as any,
      },
      {
        name: "Retired",
        icon: "icon:Archive",
        position: 4,
        recordLimit: 10,
        filters: [
          {
            field: FilterField.PROPERTY,
            propertyName: "Status",
            operator: FilterOperator.EQUALS,
            value: "Retired",
          } as any,
        ],
        sort: [{ field: SortField.PROPERTY, propertyName: "Last Updated", direction: SortDirection.DESC } as any],
        hiddenColumns: [
          "Date",
          "Market Type",
          "Pairs",
          "Timeframes",
          "Sessions",
          "Risk Per Trade %",
          "Max Daily Loss %",
          "Max Simultaneous Trades",
          "Min Sample Size",
          "Trades",
          "Total R",
          "Avg R",
          "Win Rate",
          "Profit Factor",
          "Expectancy",
          "Confidence",
        ],
        columnSummaries: {
          Name: SummaryMetric.COUNT,
          Status: SummaryMetric.UNIQUE,
          Category: SummaryMetric.UNIQUE,
          "Last Updated": SummaryMetric.LATEST,
          "Total Trades": SummaryMetric.SUM,
        } as any,
      },
    ],
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
