export const DAYS_IN_WEEK = 7;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
/** Mirrors `OpeningHoursRules::MAX_SHIFTS_PER_DAY` in the backend. */
export const MAX_SHIFTS_PER_DAY = 4;
export const DEFAULT_OPENS_TIME = "09:00";
export const DEFAULT_CLOSES_TIME = "17:00";
/** Length of a shift added with "Add shift", and the last minute a shift can end. */
export const NEW_SHIFT_MINUTES = 120;
export const LAST_MINUTE_OF_DAY = MINUTES_PER_DAY - 1;
export const BRANCH_OPTIONS_PER_PAGE = 100;
