import type { CreateDatabaseDto, CreatePropertyDto, CreateSectionDto, DatabaseType } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import type { SeedRecord } from "./initialization.seeds";
import { seedsByDatabaseType } from "./initialization.seeds";

type TemplateDefinition = {
  name: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  position?: number;
};

type InitPropertyDef = Omit<CreatePropertyDto, "databaseId" | "config"> & {
  config?: Record<string, unknown>;
};

type DatabaseTemplate = Omit<CreateDatabaseDto, "spaceId" | "properties"> & {
  type?: DatabaseType;
  properties?: InitPropertyDef[];
  seeds?: SeedRecord[];
  templates?: TemplateDefinition[];
};

export interface InitializationConfig {
  spaceNameTemplate: string;
  spaceIcon: string;
  sections: CreateSectionDto[];
  databases: DatabaseTemplate[];
  defaultDatabaseProperties: InitPropertyDef[];
}

const colors = {
  gray: "#6B7280",
  brown: "#92400E",
  amber: "#D97706",
  gold: "#CA8A04",
  green: "#16A34A",
  blue: "#2563EB",
  purple: "#7C3AED",
  pink: "#DB2777",
  red: "#DC2626",
} as const;

const SESSION_OPTIONS = [
  { value: "Asia", color: colors.gold, icon: "icon:Sun" },
  { value: "London", color: colors.red, icon: "icon:Landmark" },
  { value: "New York", color: colors.blue, icon: "icon:Building2" },
  { value: "Pre-London", color: colors.amber, icon: "icon:Sunrise" },
  { value: "Pre-New York", color: colors.gray, icon: "icon:Sunset" },
];

const TIMEFRAME_OPTIONS = [
  { value: "Weekly", color: colors.purple, icon: "icon:CalendarDays" },
  { value: "Daily", color: colors.blue, icon: "icon:Calendar" },
  { value: "4H", color: colors.green, icon: "icon:Clock4" },
  { value: "1H", color: colors.amber, icon: "icon:Clock" },
  { value: "15m", color: colors.pink, icon: "icon:Timer" },
  { value: "5m", color: colors.gold, icon: "icon:Hourglass" },
];

const OUTCOME_OPTIONS = [
  { value: "Win", color: colors.green, icon: "icon:TrendingUp" },
  { value: "Loss", color: colors.red, icon: "icon:TrendingDown" },
  { value: "Break-even", color: colors.gray, icon: "icon:Minus" },
];

const DIRECTION_OPTIONS = [
  { value: "Long", color: colors.green, icon: "icon:ArrowUp" },
  { value: "Short", color: colors.red, icon: "icon:ArrowDown" },
];

const STRUCTURE_OPTIONS = [
  { value: "FVG", color: colors.blue },
  { value: "SNR", color: colors.purple },
  { value: "Fractal", color: colors.amber },
  { value: "Premium DR", color: colors.green },
  { value: "Discount DR", color: colors.red },
];

const PAIR_CATEGORIES = [
  {
    label: "Forex",
    options: [
      { value: "EURUSD", color: colors.blue },
      { value: "GBPUSD", color: colors.purple },
      { value: "USDJPY", color: colors.amber },
      { value: "EURJPY", color: colors.green },
      { value: "GBPJPY", color: colors.pink },
    ],
  },
  {
    label: "Commodity",
    options: [{ value: "XAUUSD", color: colors.gold }],
  },
];

const TOPIC_CATEGORIES = [
  {
    label: "Topic",
    options: [
      { value: "Entry", color: colors.blue },
      { value: "Exit", color: colors.red },
      { value: "Risk Management", color: colors.amber },
      { value: "Psychology", color: colors.purple },
      { value: "Analysis", color: colors.green },
    ],
  },
];

const DATE_CONFIG = {
  defaultValue: null,
  format: "DD.MM.YYYY",
  includeTime: false,
  timeFormat: "HH:mm",
} as const;

const FORMULA_TEXT = { formula: "", output: { type: "text" } };

export const defaultInitializationConfig: InitializationConfig = {
  spaceNameTemplate: "{{username}}'s Space",
  spaceIcon: "icon:LayoutDashboard",

  sections: [
    { key: "routine", name: "Routine", position: 0, icon: "icon:CalendarDays", color: "#818cf8" },
    { key: "insight", name: "Insight", position: 1, icon: "icon:Lightbulb", color: "#fbbf24" },
    { key: "settings", name: "Settings", position: 2, icon: "icon:Settings", color: "#a78bfa" },
  ],

  databases: [
    {
      name: "[DB] Trading Journal",
      title: "Trading Journal",
      type: "trading-journal",
      icon: "icon:BookOpen",
      sectionKey: "routine",
      seeds: seedsByDatabaseType["trading-journal"],
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Trade name or journal entry title",
          group: "General",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the trade was opened or closed",
          group: "General",
        },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 2,
          config: { sourceDatabaseType: "accounts", multiple: false },
          hint: "Trading account used to open this trade",
          group: "General",
        },
        {
          name: "Pair",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
          hint: "Trading instrument or currency pair",
          group: "General",
        },
        {
          name: "Session",
          type: PropertyType.SELECT,
          position: 4,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Session", options: SESSION_OPTIONS }],
          },
          hint: "Trading session at the time of entry",
          group: "General",
        },
        {
          name: "Direction",
          type: PropertyType.SELECT,
          position: 5,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Direction", options: DIRECTION_OPTIONS }],
          },
          hint: "Trade direction — Long (buy) or Short (sell)",
          group: "Trade Setup",
        },
        {
          name: "Narrative TF",
          type: PropertyType.SELECT,
          position: 6,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Timeframe", options: TIMEFRAME_OPTIONS }],
          },
          hint: "Timeframe of the main narrative used for analysis",
          group: "Trade Setup",
        },
        {
          name: "Result",
          type: PropertyType.SELECT,
          position: 7,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Result", options: OUTCOME_OPTIONS }],
          },
          hint: "Trade outcome: win, loss, or break-even",
          group: "Outcome",
        },
        {
          name: "Gained RR",
          type: PropertyType.NUMBER,
          position: 8,
          config: { defaultValue: 0, format: "float", decimalPlaces: 2 },
          hint: "Actual risk-to-reward ratio achieved (R:R)",
          group: "Outcome",
        },
        {
          name: "Position Type",
          type: PropertyType.SELECT,
          position: 9,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Intraday", color: colors.blue },
                  { value: "Introweek", color: colors.purple },
                  { value: "Swing", color: colors.amber },
                ],
              },
            ],
          },
          hint: "Position type by time horizon: intraday, introweek, or swing",
          group: "Trade Setup",
        },
        {
          name: "Trade Position Type",
          type: PropertyType.SELECT,
          position: 10,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Reversal", color: colors.red },
                  { value: "Continuation", color: colors.green },
                  { value: "Retracement", color: colors.amber },
                ],
              },
            ],
          },
          hint: "Price movement character: reversal, continuation, or retracement",
          group: "Trade Setup",
        },
        {
          name: "Entry Model",
          type: PropertyType.SELECT,
          position: 11,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Model",
                options: [
                  { value: "FVG", color: colors.blue },
                  { value: "Order Block", color: colors.purple },
                  { value: "BOS", color: colors.green },
                  { value: "MSS", color: colors.amber },
                  { value: "Breaker Block", color: colors.red },
                  { value: "Mitigation Block", color: colors.pink },
                  { value: "CISD", color: colors.gold },
                ],
              },
            ],
          },
          hint: "Entry model used for this trade",
          group: "Entry",
        },
        {
          name: "Entry Timeframe",
          type: PropertyType.SELECT,
          position: 12,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Timeframe", options: TIMEFRAME_OPTIONS }],
          },
          hint: "Timeframe used to identify the entry point",
          group: "Entry",
        },
        {
          name: "Point A",
          type: PropertyType.SELECT,
          position: 13,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Structure", options: STRUCTURE_OPTIONS }],
          },
          hint: "Structure or level confirming the start of the price move",
          group: "Entry",
        },
        {
          name: "Point B",
          type: PropertyType.SELECT,
          position: 14,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Structure", options: STRUCTURE_OPTIONS }],
          },
          hint: "Target level or exit zone",
          group: "Entry",
        },
        {
          name: "Stop Loss position",
          type: PropertyType.SELECT,
          position: 15,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Position",
                options: [
                  { value: "Below Structure", color: colors.green },
                  { value: "Above Structure", color: colors.red },
                  { value: "Below FVG", color: colors.blue },
                  { value: "Above FVG", color: colors.amber },
                  { value: "Below OB", color: colors.gold },
                  { value: "Above OB", color: colors.pink },
                ],
              },
            ],
          },
          hint: "Stop loss placement relative to market structure",
          group: "Entry",
        },
        {
          name: "Delivery",
          type: PropertyType.SELECT,
          position: 16,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Delivery",
                options: [
                  { value: "Order Flow", color: colors.blue },
                  { value: "Strong Order Flow", color: colors.purple },
                ],
              },
            ],
          },
          hint: "Price delivery type to target: standard or strong order flow",
          group: "Execution",
        },
        {
          name: "Session Confirm",
          type: PropertyType.SELECT,
          position: 17,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Session", options: SESSION_OPTIONS }],
          },
          hint: "Session during which the signal was confirmed",
          group: "Execution",
        },
        {
          name: "Session Point",
          type: PropertyType.SELECT,
          position: 18,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Point",
                options: [
                  { value: "Open", color: colors.blue },
                  { value: "High", color: colors.green },
                  { value: "Low", color: colors.red },
                  { value: "Sweep", color: colors.amber },
                  { value: "Reversal", color: colors.purple },
                ],
              },
            ],
          },
          hint: "Key session point used for entry",
          group: "Execution",
        },
        {
          name: "Daily Routine",
          type: PropertyType.RELATION,
          position: 19,
          config: { sourceDatabaseType: "daily-routine", multiple: false },
          hint: "Linked session analysis entry",
          group: "Related",
        },
        {
          name: "Notes",
          type: PropertyType.RELATION,
          position: 20,
          config: { sourceDatabaseType: "notes", multiple: true },
          hint: "Notes related to this trade",
          group: "Related",
        },
        {
          name: "Mistakes",
          type: PropertyType.RELATION,
          position: 21,
          config: { sourceDatabaseType: "mistakes", multiple: true },
          hint: "Mistakes made during this trade",
          group: "Related",
        },
      ],
      templates: [
        {
          name: "Quick Trade",
          description: "Fast entry for standard trades with minimal fields",
          isDefault: true,
          position: 0,
        },
        {
          name: "Full Analysis",
          description: "Complete trade documentation with all fields filled",
          isDefault: false,
          position: 1,
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
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Session analysis title",
          group: "General",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the analysis session was conducted",
          group: "General",
        },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 2,
          config: { sourceDatabaseType: "accounts", multiple: false },
          hint: "Trading account for this session",
          group: "General",
        },
        {
          name: "Pair",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
          hint: "Instrument analyzed in this session",
          group: "General",
        },
        {
          name: "Session",
          type: PropertyType.SELECT,
          position: 4,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Session", options: SESSION_OPTIONS }],
          },
          hint: "Market session for this analysis",
          group: "General",
        },
        {
          name: "Direction",
          type: PropertyType.SELECT,
          position: 5,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Direction", options: DIRECTION_OPTIONS }],
          },
          hint: "Expected bias direction for this session",
          group: "General",
        },
        {
          name: "Trading System",
          type: PropertyType.RELATION,
          position: 6,
          config: { sourceDatabaseType: "trading-system", multiple: false },
          hint: "Trading system applied in this session",
          group: "Analysis",
        },
        {
          name: "Narrative",
          type: PropertyType.SELECT,
          position: 7,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Bias",
                options: [
                  { value: "Bullish", color: colors.green, icon: "icon:TrendingUp" },
                  { value: "Bearish", color: colors.red, icon: "icon:TrendingDown" },
                  { value: "Neutral", color: colors.gray, icon: "icon:Minus" },
                  { value: "Uncertain", color: colors.amber, icon: "icon:HelpCircle" },
                ],
              },
            ],
          },
          hint: "Market narrative — expected price direction",
          group: "Analysis",
        },
        {
          name: "Outcome",
          type: PropertyType.SELECT,
          position: 8,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Outcome", options: OUTCOME_OPTIONS }],
          },
          hint: "Session analysis outcome",
          group: "Analysis",
        },
        {
          name: "Narrative Accurate",
          type: PropertyType.FORMULA,
          position: 9,
          config: FORMULA_TEXT,
          hint: "Whether the market narrative matched actual price movement",
          group: "Analysis",
        },
        {
          name: "Execution",
          type: PropertyType.FORMULA,
          position: 10,
          config: FORMULA_TEXT,
          hint: "Quality of trade plan execution in this session",
          group: "Analysis",
        },
        {
          name: "Trades",
          type: PropertyType.RELATION,
          position: 11,
          config: { sourceDatabaseType: "trading-journal", multiple: true },
          hint: "Trades taken within this session",
          group: "Related",
        },
      ],
      templates: [
        {
          name: "Pre-Market Session",
          description: "Pre-market preparation and bias definition",
          isDefault: true,
          position: 0,
        },
        {
          name: "Post-Market Review",
          description: "End-of-session trade review and performance analysis",
          isDefault: false,
          position: 1,
        },
      ],
    },

    {
      name: "[DB] Notes",
      title: "Notes",
      type: "notes",
      icon: "icon:StickyNote",
      sectionKey: "insight",
      seeds: seedsByDatabaseType["notes"],
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Note or observation title",
          group: "General",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the note was created",
          group: "General",
        },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Lesson", color: colors.blue, icon: "icon:BookOpen" },
                  { value: "Rule", color: colors.red, icon: "icon:Scale" },
                  { value: "Observation", color: colors.amber, icon: "icon:Eye" },
                  { value: "Strategy", color: colors.green, icon: "icon:Target" },
                  { value: "Psychology", color: colors.purple, icon: "icon:Brain" },
                ],
              },
            ],
          },
          hint: "Note category by purpose",
          group: "General",
        },
        {
          name: "Topic",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: TOPIC_CATEGORIES },
          hint: "Subject or knowledge area this note relates to",
          group: "General",
        },
        {
          name: "Date of Last Use",
          type: PropertyType.FORMULA,
          position: 4,
          config: FORMULA_TEXT,
          hint: "Date this note was last applied in work",
          group: "Stats",
        },
        {
          name: "Used in Analysis",
          type: PropertyType.NUMBER,
          position: 5,
          config: { defaultValue: 0, format: "integer" },
          hint: "Number of times this note was applied in analysis",
          group: "Stats",
        },
        {
          name: "Used in Trades",
          type: PropertyType.NUMBER,
          position: 6,
          config: { defaultValue: 0, format: "integer" },
          hint: "Number of times this note was applied in trades",
          group: "Stats",
        },
      ],
      templates: [
        {
          name: "Lesson",
          description: "Key learning captured from a trade or analysis session",
          isDefault: true,
          position: 0,
        },
        {
          name: "Strategy Note",
          description: "Documentation of a trading rule or strategic approach",
          isDefault: false,
          position: 1,
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
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Mistake name or short description",
          group: "General",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the mistake was recorded",
          group: "General",
        },
        {
          name: "Severity",
          type: PropertyType.STATUS,
          position: 2,
          config: {
            defaultOption: "Minor",
            categories: [
              {
                category: "todo",
                defaultOption: "Minor",
                options: [
                  { name: "Minor", color: colors.gray },
                  { name: "Moderate", color: colors.amber },
                ],
              },
              {
                category: "in_progress",
                defaultOption: "Major",
                options: [
                  { name: "Major", color: colors.red },
                  { name: "Critical", color: colors.brown },
                ],
              },
              {
                category: "complete",
                defaultOption: "Resolved",
                options: [{ name: "Resolved", color: colors.green }],
              },
            ],
          },
          hint: "Degree of impact this mistake had on trading results",
          group: "General",
        },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 3,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Discipline", color: colors.red },
                  { value: "Analysis", color: colors.blue },
                  { value: "Execution", color: colors.amber },
                  { value: "Risk Management", color: colors.gold },
                  { value: "Psychology", color: colors.purple },
                ],
              },
            ],
          },
          hint: "Mistake category by area of impact",
          group: "General",
        },
        {
          name: "Topic",
          type: PropertyType.SELECT,
          position: 4,
          config: { isMultiSelect: false, categories: TOPIC_CATEGORIES },
          hint: "Trading aspect this mistake relates to",
          group: "General",
        },
        {
          name: "Date of Last Use",
          type: PropertyType.FORMULA,
          position: 5,
          config: FORMULA_TEXT,
          hint: "Date this mistake was last repeated",
          group: "Stats",
        },
        {
          name: "Used in Analysis",
          type: PropertyType.NUMBER,
          position: 6,
          config: { defaultValue: 0, format: "integer" },
          hint: "Number of times this mistake appeared in analysis",
          group: "Stats",
        },
        {
          name: "Used in Trades",
          type: PropertyType.NUMBER,
          position: 7,
          config: { defaultValue: 0, format: "integer" },
          hint: "Number of trades where this mistake was made",
          group: "Stats",
        },
      ],
      templates: [
        {
          name: "Trade Mistake",
          description: "Mistake made during trade execution or management",
          isDefault: true,
          position: 0,
        },
        {
          name: "Analysis Mistake",
          description: "Error in market reading, bias, or session preparation",
          isDefault: false,
          position: 1,
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
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Trading account name",
          group: "General",
        },
        {
          name: "Started",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the account was opened or started",
          group: "General",
        },
        {
          name: "Account Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Funded", color: colors.green, icon: "icon:Briefcase" },
                  { value: "Personal", color: colors.blue, icon: "icon:User" },
                  { value: "Demo", color: colors.gray, icon: "icon:FlaskConical" },
                  { value: "Challenge", color: colors.amber, icon: "icon:Trophy" },
                ],
              },
            ],
          },
          hint: "Account type: funded, personal, demo, or challenge",
          group: "General",
        },
        {
          name: "Status",
          type: PropertyType.STATUS,
          position: 3,
          config: {
            defaultOption: "Active",
            categories: [
              {
                category: "todo",
                defaultOption: "Demo",
                options: [
                  { name: "Demo", color: colors.gray },
                  { name: "Challenge", color: colors.amber },
                ],
              },
              {
                category: "in_progress",
                defaultOption: "Active",
                options: [
                  { name: "Active", color: colors.blue },
                  { name: "Paused", color: colors.gold },
                ],
              },
              {
                category: "complete",
                defaultOption: "Funded",
                options: [
                  { name: "Funded", color: colors.green },
                  { name: "Closed", color: colors.brown },
                  { name: "Failed", color: colors.red },
                ],
              },
            ],
          },
          hint: "Current account status",
          group: "General",
        },
        {
          name: "Starting Equity",
          type: PropertyType.NUMBER,
          position: 4,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
          hint: "Initial account equity",
          group: "Financials",
        },
        {
          name: "Current Equity",
          type: PropertyType.NUMBER,
          position: 5,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
          hint: "Current account equity",
          group: "Financials",
        },
        {
          name: "Operations",
          type: PropertyType.RELATION,
          position: 6,
          config: { sourceDatabaseType: "operations", multiple: true },
          hint: "Deposit or withdrawal operations for this account",
          group: "Financials",
        },
      ],
      templates: [
        { name: "Funded Account", description: "Prop firm funded trading account", isDefault: true, position: 0 },
        { name: "Personal Account", description: "Personal or demo trading account", isDefault: false, position: 1 },
      ],
    },

    {
      name: "[DB] Operations",
      title: "Operations",
      type: "operations",
      icon: "icon:ArrowLeftRight",
      sectionKey: "settings",
      seeds: seedsByDatabaseType["operations"],
      properties: [
        { name: "Name", type: PropertyType.TEXT, isRequired: true, position: 0, hint: "Operation name or description" },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 1,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: [
                  { value: "Deposit", color: colors.green, icon: "icon:ArrowDownToLine" },
                  { value: "Withdrawal", color: colors.red, icon: "icon:ArrowUpFromLine" },
                ],
              },
            ],
          },
          hint: "Operation type: deposit or withdrawal",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 2,
          config: DATE_CONFIG,
          hint: "Date the operation was processed",
        },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 3,
          config: { sourceDatabaseType: "accounts", multiple: false },
          hint: "Account this operation belongs to",
        },
        {
          name: "Amount",
          type: PropertyType.NUMBER,
          position: 4,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
          hint: "Operation amount in USD",
        },
      ],
      templates: [
        { name: "Deposit", description: "Funds added to a trading account", isDefault: true, position: 0 },
        { name: "Withdrawal", description: "Funds withdrawn from a trading account", isDefault: false, position: 1 },
      ],
    },

    {
      name: "[DB] Trading Systems",
      title: "Trading Systems",
      type: "trading-system",
      icon: "icon:Target",
      sectionKey: "settings",
      seeds: seedsByDatabaseType["trading-system"],
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          position: 0,
          hint: "Trading system or strategy name",
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
          config: DATE_CONFIG,
          hint: "Date the system was created or last updated",
        },
      ],
      templates: [
        {
          name: "Main System",
          description: "Primary trading strategy used in live sessions",
          isDefault: true,
          position: 0,
        },
        {
          name: "Alternative System",
          description: "Secondary or experimental trading approach",
          isDefault: false,
          position: 1,
        },
      ],
    },
  ],

  defaultDatabaseProperties: [
    {
      name: "Name",
      type: PropertyType.TEXT,
      position: 0,
      isRequired: true,
    },
  ],
};
