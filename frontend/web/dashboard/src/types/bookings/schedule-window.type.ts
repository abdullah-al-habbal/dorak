/** Inclusive `YYYY-MM-DD` bounds; `to` is absent for an open-ended window. */
export interface ScheduleWindow {
  from: string;
  to?: string;
}
