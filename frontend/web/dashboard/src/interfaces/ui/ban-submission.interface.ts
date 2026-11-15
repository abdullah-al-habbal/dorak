export interface BanSubmission {
  reason: string;
  /** ISO date-time; undefined bans permanently. */
  expiresAt?: string;
}
