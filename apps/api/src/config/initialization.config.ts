import { CreateDatabaseDto, CreatePropertyDto, CreateSectionDto, PropertyType } from "@nucleus/domain";

export interface InitializationConfig {
  spaceNameTemplate: string;
  sections: CreateSectionDto[];
  databases: CreateDatabaseDto[];
  defaultDatabaseProperties: CreatePropertyDto[];
}

const PAIR_CATEGORIES = [
  { label: "Forex", options: ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "GBPJPY"] },
  { label: "Commodity", options: ["XAUUSD"] },
];

const TOPIC_CATEGORIES = [
  { label: "Topic", options: ["Entry", "Exit", "Risk Management", "Psychology", "Analysis"] },
];

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
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 2,
          config: { sourceDatabaseType: "accounts", multiple: false },
        },
        {
          name: "Pair",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
        },
        {
          name: "Session",
          type: PropertyType.SELECT,
          position: 4,
          config: {
            isMultiSelect: false,
            categories: [
              { label: "Session", options: ["Asia", "London", "New York", "Pre-London", "Pre-New York"] },
            ],
          },
        },
        {
          name: "Direction",
          type: PropertyType.SELECT,
          position: 5,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Direction", options: ["Long", "Short"] }],
          },
        },
        {
          name: "Narrative TF",
          type: PropertyType.SELECT,
          position: 6,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Timeframe", options: ["Weekly", "Daily", "4H", "1H", "15m", "5m"] }],
          },
        },
        {
          name: "Result",
          type: PropertyType.SELECT,
          position: 7,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Result", options: ["Win", "Loss", "Break-even"] }],
          },
        },
        {
          name: "Gained RR",
          type: PropertyType.NUMBER,
          position: 8,
          config: { defaultValue: 0, format: "float", decimalPlaces: 2 },
        },
        {
          name: "Position Type",
          type: PropertyType.SELECT,
          position: 9,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Intraday", "Introweek", "Swing"] }],
          },
        },
        {
          name: "Trade Position Type",
          type: PropertyType.SELECT,
          position: 10,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Reversal", "Continuation", "Retracement"] }],
          },
        },
        {
          name: "Entry Model",
          type: PropertyType.SELECT,
          position: 11,
          config: {
            isMultiSelect: false,
            categories: [
              { label: "Model", options: ["FVG", "Order Block", "BOS", "MSS", "Breaker Block", "Mitigation Block", "CISD"] },
            ],
          },
        },
        {
          name: "Entry Timeframe",
          type: PropertyType.SELECT,
          position: 12,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Timeframe", options: ["Weekly", "Daily", "4H", "1H", "15m", "5m"] }],
          },
        },
        {
          name: "Point A",
          type: PropertyType.SELECT,
          position: 13,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Structure", options: ["FVG", "SNR", "Fractal", "Premium DR", "Discount DR"] }],
          },
        },
        {
          name: "Point B",
          type: PropertyType.SELECT,
          position: 14,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Structure", options: ["FVG", "SNR", "Fractal", "Premium DR", "Discount DR"] }],
          },
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
        },
        {
          name: "Delivery",
          type: PropertyType.SELECT,
          position: 16,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Delivery", options: ["Order Flow", "Strong Order Flow"] }],
          },
        },
        {
          name: "Session Confirm",
          type: PropertyType.SELECT,
          position: 17,
          config: {
            isMultiSelect: false,
            categories: [
              { label: "Session", options: ["Asia", "London", "New York", "Pre-London", "Pre-New York"] },
            ],
          },
        },
        {
          name: "Session Point",
          type: PropertyType.SELECT,
          position: 18,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Point", options: ["Open", "High", "Low", "Sweep", "Reversal"] }],
          },
        },
        {
          name: "Daily Routine",
          type: PropertyType.RELATION,
          position: 19,
          config: { sourceDatabaseType: "daily-routine", multiple: false },
        },
        {
          name: "Notes",
          type: PropertyType.RELATION,
          position: 20,
          config: { sourceDatabaseType: "notes", multiple: true },
        },
        {
          name: "Mistakes",
          type: PropertyType.RELATION,
          position: 21,
          config: { sourceDatabaseType: "mistakes", multiple: true },
        },
      ],
    },

    {
      name: "[DB] Session Routine",
      title: "Session Routine",
      type: "daily-routine",
      sectionKey: "routine",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 2,
          config: { sourceDatabaseType: "accounts", multiple: false },
        },
        {
          name: "Pair",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
        },
        {
          name: "Trading System",
          type: PropertyType.RELATION,
          position: 4,
          config: { sourceDatabaseType: "trading-system", multiple: false },
        },
        {
          name: "Narrative",
          type: PropertyType.SELECT,
          position: 5,
          config: { isMultiSelect: false, categories: [] },
        },
        {
          name: "Outcome",
          type: PropertyType.SELECT,
          position: 6,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Outcome", options: ["Win", "Loss", "Break-even"] }],
          },
        },
        { name: "Narrative Accurate", type: PropertyType.FORMULA, position: 7, config: FORMULA_TEXT },
        { name: "Execution", type: PropertyType.FORMULA, position: 8, config: FORMULA_TEXT },
        {
          name: "Trades",
          type: PropertyType.RELATION,
          position: 9,
          config: { sourceDatabaseType: "trading-journal", multiple: true },
        },
      ],
    },

    {
      name: "[DB] Notes",
      title: "Notes",
      type: "notes",
      sectionKey: "insight",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        {
          name: "Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [
              { label: "Type", options: ["Lesson", "Rule", "Observation", "Strategy", "Psychology"] },
            ],
          },
        },
        {
          name: "Topic",
          type: PropertyType.SELECT,
          position: 3,
          config: { isMultiSelect: false, categories: TOPIC_CATEGORIES },
        },
        { name: "Date of Last Use", type: PropertyType.FORMULA, position: 4, config: FORMULA_TEXT },
        {
          name: "Used in Analysis",
          type: PropertyType.NUMBER,
          position: 5,
          config: { defaultValue: 0, format: "integer" },
        },
        {
          name: "Used in Trades",
          type: PropertyType.NUMBER,
          position: 6,
          config: { defaultValue: 0, format: "integer" },
        },
      ],
    },

    {
      name: "[DB] Mistakes",
      title: "Mistakes",
      type: "mistakes",
      sectionKey: "insight",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        { name: "Severity", type: PropertyType.FORMULA, position: 2, config: FORMULA_TEXT },
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
        },
        {
          name: "Topic",
          type: PropertyType.SELECT,
          position: 4,
          config: { isMultiSelect: false, categories: TOPIC_CATEGORIES },
        },
        { name: "Date of Last Use", type: PropertyType.FORMULA, position: 5, config: FORMULA_TEXT },
        {
          name: "Used in Analysis",
          type: PropertyType.NUMBER,
          position: 6,
          config: { defaultValue: 0, format: "integer" },
        },
        {
          name: "Used in Trades",
          type: PropertyType.NUMBER,
          position: 7,
          config: { defaultValue: 0, format: "integer" },
        },
      ],
    },

    {
      name: "[DB] Accounts",
      title: "Accounts",
      type: "accounts",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Started", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        {
          name: "Account Type",
          type: PropertyType.SELECT,
          position: 2,
          config: {
            isMultiSelect: false,
            categories: [{ label: "Type", options: ["Funded", "Personal", "Demo", "Challenge"] }],
          },
        },
        { name: "Status", type: PropertyType.STATUS, position: 3 },
        {
          name: "Starting Equity",
          type: PropertyType.NUMBER,
          position: 4,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
        },
        {
          name: "Current Equity",
          type: PropertyType.NUMBER,
          position: 5,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
        },
        {
          name: "Payouts",
          type: PropertyType.RELATION,
          position: 6,
          config: { sourceDatabaseType: "payouts", multiple: true },
        },
      ],
    },

    {
      name: "[DB] Payouts",
      title: "Payouts",
      type: "payouts",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
        {
          name: "Account",
          type: PropertyType.RELATION,
          position: 2,
          config: { sourceDatabaseType: "accounts", multiple: false },
        },
        {
          name: "Amount",
          type: PropertyType.NUMBER,
          position: 3,
          config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
        },
      ],
    },

    {
      name: "[DB] Trading Systems",
      title: "Trading Systems",
      type: "trading-system",
      sectionKey: "settings",
      properties: [
        { name: "Name", type: PropertyType.TEXT, isPrimary: true, position: 0 },
        { name: "Date", type: PropertyType.DATE, position: 1, config: DATE_CONFIG },
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
