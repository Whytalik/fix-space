export interface VisibleSections {
  activity: boolean;
  breakdowns: boolean;
  ratings: boolean;
  numbers: boolean;
}

export const DEFAULT_VISIBLE_SECTIONS: VisibleSections = {
  activity: true,
  breakdowns: true,
  ratings: true,
  numbers: true,
};
