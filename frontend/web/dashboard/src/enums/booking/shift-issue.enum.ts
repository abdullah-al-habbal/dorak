export enum ShiftIssue {
  /** Closing time is not after opening time. */
  Inverted = "inverted",
  /** Starts before the previous shift ends. */
  Overlap = "overlap",
}
