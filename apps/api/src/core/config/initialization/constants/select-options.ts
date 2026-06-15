import { colors } from "./colors";

export const SESSION_OPTIONS = [
  { value: "Asia", color: colors.gold, icon: "icon:Sun" },
  { value: "London", color: colors.red, icon: "icon:Landmark" },
  { value: "New York", color: colors.blue, icon: "icon:Building2" },
  { value: "Pre-London", color: colors.amber, icon: "icon:Sunrise" },
  { value: "Pre-New York", color: colors.gray, icon: "icon:Sunset" },
];

export const TIMEFRAME_OPTIONS = [
  { value: "Weekly", color: colors.purple, icon: "icon:CalendarDays" },
  { value: "Daily", color: colors.blue, icon: "icon:Calendar" },
  { value: "4H", color: colors.green, icon: "icon:Clock4" },
  { value: "1H", color: colors.amber, icon: "icon:Clock" },
  { value: "15m", color: colors.pink, icon: "icon:Timer" },
  { value: "5m", color: colors.gold, icon: "icon:Hourglass" },
];

export const OUTCOME_OPTIONS = [
  { value: "Win", color: colors.green, icon: "icon:TrendingUp" },
  { value: "Loss", color: colors.red, icon: "icon:TrendingDown" },
  { value: "Break-even", color: colors.gray, icon: "icon:Minus" },
];

export const DIRECTION_OPTIONS = [
  { value: "Long", color: colors.green, icon: "icon:ArrowUp" },
  { value: "Short", color: colors.red, icon: "icon:ArrowDown" },
];

export const STRUCTURE_OPTIONS = [
  { value: "FVG", color: colors.blue, icon: "icon:Layers" },
  { value: "SNR", color: colors.purple, icon: "icon:SeparatorHorizontal" },
  { value: "Fractal", color: colors.amber, icon: "icon:GitBranch" },
  { value: "Premium DR", color: colors.green, icon: "icon:ArrowDownToLine" },
  { value: "Discount DR", color: colors.red, icon: "icon:ArrowUpFromLine" },
];

export const PAIR_CATEGORIES = [
  {
    label: "Forex",
    options: [
      { value: "EURUSD", color: colors.blue, icon: "icon:DollarSign" },
      { value: "GBPUSD", color: colors.purple, icon: "icon:PoundSterling" },
      { value: "USDJPY", color: colors.amber, icon: "icon:CircleDot" },
      { value: "EURJPY", color: colors.green, icon: "icon:CircleDot" },
      { value: "GBPJPY", color: colors.pink, icon: "icon:CircleDot" },
    ],
  },
  {
    label: "Commodity",
    options: [{ value: "XAUUSD", color: colors.gold, icon: "icon:CircleDot" }],
  },
];

export const TOPIC_CATEGORIES = [
  {
    label: "Topic",
    options: [
      { value: "Entry", color: colors.blue, icon: "icon:ArrowRightFromLine" },
      { value: "Exit", color: colors.red, icon: "icon:ArrowLeftFromLine" },
      { value: "Risk Management", color: colors.amber, icon: "icon:Shield" },
      { value: "Psychology", color: colors.purple, icon: "icon:Heart" },
      { value: "Analysis", color: colors.green, icon: "icon:Search" },
    ],
  },
];
