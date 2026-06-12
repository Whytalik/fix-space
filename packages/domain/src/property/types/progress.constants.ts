export const DEFAULT_PROGRESS_PROPERTY = {
  defaultValue: null as number | null,
  minValue: 0,
  maxValue: 100,
  step: 1,
  showLabel: true,
  thresholds: [] as { upTo: number; color: string }[],
  mode: "custom",
};
