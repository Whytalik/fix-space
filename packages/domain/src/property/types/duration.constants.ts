export const DURATION_FORMAT_VALUES = ["HH:mm", "HH:mm:ss", "Xh Ym", "minutes", "seconds"] as const;
export type DurationFormat = (typeof DURATION_FORMAT_VALUES)[number];

export const DEFAULT_DURATION_PROPERTY = {
  defaultValue: null as number | null,
  format: "HH:mm" as DurationFormat,
};
