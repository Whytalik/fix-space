import { CreateDatabaseDto, CreatePropertyDto, CreateSectionDto, DatabaseType, PropertyType } from "@nucleus/domain";

type DatabaseTemplate = Omit<CreateDatabaseDto, "spaceId" | "properties"> & {
  type?: DatabaseType;
  properties?: Omit<CreatePropertyDto, "databaseId">[];
};

export interface InitializationConfig {
  spaceNameTemplate: string;
  sections: CreateSectionDto[];
  databases: DatabaseTemplate[];
  defaultDatabaseProperties: Omit<CreatePropertyDto, "databaseId">[];
}

const PAIR_CATEGORIES = [
  { label: "Forex", options: ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "GBPJPY"] },
  { label: "Commodity", options: ["XAUUSD"] },
];

const TOPIC_CATEGORIES = [{ label: "Topic", options: ["Entry", "Exit", "Risk Management", "Psychology", "Analysis"] }];

const DATE_CONFIG = {
  defaultValue: null,
  format: "DD.MM.YYYY",
  includeTime: false,
  timeFormat: "HH:mm",
};

const FORMULA_TEXT = { formula: "", output: { type: "text" } };

export const defaultInitializationConfig: InitializationConfig = {
  spaceNameTemplate: "{{username}}'s Space",

  sections: [
    { key: "routine", name: "Routine", position: 0 },
    { key: "insight", name: "Insight", position: 1 },
    { key: "settings", name: "Settings", position: 2 },
  ],

  databases: [
    {
      name: "[DB] Trading Journal",
      title: "Trading Journal",
      type: "trading-journal",
      sectionKey: "routine",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Trade name or journal entry title", group: "General" },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the trade was opened or closed", group: "General" },
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
            categories: [{ label: "Session", options: ["Asia", "London", "New York", "Pre-London", "Pre-New York"] }],
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
            categories: [{ label: "Direction", options: ["Long", "Short"] }],
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
            categories: [{ label: "Timeframe", options: ["Weekly", "Daily", "4H", "1H", "15m", "5m"] }],
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
            categories: [{ label: "Result", options: ["Win", "Loss", "Break-even"] }],
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
            categories: [{ label: "Type", options: ["Intraday", "Introweek", "Swing"] }],
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
            categories: [{ label: "Type", options: ["Reversal", "Continuation", "Retracement"] }],
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
                options: ["FVG", "Order Block", "BOS", "MSS", "Breaker Block", "Mitigation Block", "CISD"],
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
            categories: [{ label: "Timeframe", options: ["Weekly", "Daily", "4H", "1H", "15m", "5m"] }],
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
            categories: [{ label: "Structure", options: ["FVG", "SNR", "Fractal", "Premium DR", "Discount DR"] }],
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
            categories: [{ label: "Structure", options: ["FVG", "SNR", "Fractal", "Premium DR", "Discount DR"] }],
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
                options: ["Below Structure", "Above Structure", "Below FVG", "Above FVG", "Below OB", "Above OB"],
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
            categories: [{ label: "Delivery", options: ["Order Flow", "Strong Order Flow"] }],
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
            categories: [{ label: "Session", options: ["Asia", "London", "New York", "Pre-London", "Pre-New York"] }],
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
            categories: [{ label: "Point", options: ["Open", "High", "Low", "Sweep", "Reversal"] }],
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
    },

    {
      name: "[DB] Session Routine",
      title: "Session Routine",
      type: "daily-routine",
      sectionKey: "routine",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Session analysis title", group: "General" },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the analysis session was conducted", group: "General" },
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
          name: "Trading System",
          type: PropertyType.RELATION,
          position: 4,
          config: { sourceDatabaseType: "trading-system", multiple: false },
          hint: "Trading system applied in this session",
          group: "Analysis",
        },
        {
          name: "Narrative",
          type: PropertyType.SELECT,
          position: 5,
          config: { isMultiSelect: false, categories: [] },
          hint: "Market narrative — expected price direction",
          group: "Analysis",
        },
        {
          name: "Outcome",
          type: PropertyType.SELECT,
          position: 6,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Outcome", options: ["Win", "Loss", "Break-even"] }],
          },
          hint: "Session analysis outcome",
          group: "Analysis",
        },
        { name: "Narrative Accurate", type: PropertyType.FORMULA, position: 7, config: FORMULA_TEXT, hint: "Whether the market narrative matched actual price movement", group: "Analysis" },
        { name: "Execution", type: PropertyType.FORMULA, position: 8, config: FORMULA_TEXT, hint: "Quality of trade plan execution in this session", group: "Analysis" },
        {
          name: "Trades",
          type: PropertyType.RELATION,
          position: 9,
          config: { sourceDatabaseType: "trading-journal", multiple: true },
          hint: "Trades taken within this session",
          group: "Related",
        },
      ],
    },

    {
      name: "[DB] Notes",
      title: "Notes",
      type: "notes",
      sectionKey: "insight",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Note or observation title", group: "General" },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the note was created", group: "General" },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Lesson", "Rule", "Observation", "Strategy", "Psychology"] }],
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
        { name: "Date of Last Use", type: PropertyType.FORMULA, position: 4, config: FORMULA_TEXT, hint: "Date this note was last applied in work", group: "Stats" },
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
    },

    {
      name: "[DB] Mistakes",
      title: "Mistakes",
      type: "mistakes",
      sectionKey: "insight",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Mistake name or short description", group: "General" },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the mistake was recorded", group: "General" },
        { name: "Severity", type: PropertyType.FORMULA, position: 2, config: FORMULA_TEXT, hint: "Degree of impact this mistake had on trading results", group: "General" },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 3,
          config: {
            isMultiSelect: false,
            categories: [
              {
                label: "Type",
                options: ["Discipline", "Analysis", "Execution", "Risk Management", "Psychology"],
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
        { name: "Date of Last Use", type: PropertyType.FORMULA, position: 5, config: FORMULA_TEXT, hint: "Date this mistake was last repeated", group: "Stats" },
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
    },

    {
      name: "[DB] Accounts",
      title: "Accounts",
      type: "accounts",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Trading account name", group: "General" },
        { name: "Started", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the account was opened or started", group: "General" },
        {
          name: "Account Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Funded", "Personal", "Demo", "Challenge"] }],
          },
          hint: "Account type: funded, personal, demo, or challenge",
          group: "General",
        },
        { name: "Status", type: PropertyType.STATUS, position: 3, hint: "Current account status", group: "General" },
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
    },

    {
      name: "[DB] Operations",
      title: "Operations",
      type: "operations",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Operation name or description" },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 1,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Deposit", "Withdrawal"] }],
          },
          hint: "Operation type: deposit or withdrawal",
        },
        { name: "Date", type: PropertyType.DATE, position: 2, config: DATE_CONFIG, hint: "Date the operation was processed" },
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
    },

    {
      name: "[DB] Trading Systems",
      title: "Trading Systems",
      type: "trading-system",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0, hint: "Trading system or strategy name" },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG, hint: "Date the system was created or last updated" },
      ],
    },
  ],

  defaultDatabaseProperties: [
    {
      name: "Name",
      type: PropertyType.TEXT,
      position: 0,
      isRequired: true,
      isPrimary: true,
    },
  ],
};
