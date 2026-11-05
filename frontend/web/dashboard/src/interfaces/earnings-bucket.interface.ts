/** One bar: a day, or a week when the range is long. Dates are `YYYY-MM-DD`. */
export interface EarningsBucket {
  start: string;
  end: string;
  gross_minor: number;
  bookings: number;
}
