export const DATA_FORMATS_VALUES = ["DD.MM.YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;
export type DataFormat = (typeof DATA_FORMATS_VALUES)[number];

export const TIME_FORMATS_VALUES = ["HH:mm", "hh:mm A"] as const;
export type TimeFormat = (typeof TIME_FORMATS_VALUES)[number];

export const DEFAULT_DATE_PROPERTY = {
  defaultValue: null as string | null,
  format: DATA_FORMATS_VALUES[0],
  includeTime: true,
  timeFormat: TIME_FORMATS_VALUES[0],
  enableEndDate: false,
  endDateTimeFormat: "YYYY-MM-DD HH:mm",
};
