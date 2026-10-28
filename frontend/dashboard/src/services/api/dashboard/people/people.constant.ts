export const AFFILIATION_STATUSES = [
  "pending",
  "active",
  "rejected",
  "terminated",
] as const;
export const APPLICATION_STATUSES = [
  "submitted",
  "seen",
  "accepted",
  "rejected",
] as const;
export const JOB_POSTING_STATUSES = ["open", "closed", "archived"] as const;

/** Decisions a branch may take on an applicant (accepted/rejected are final). */
export const APPLICATION_DECISIONS = ["accepted", "rejected"] as const;

export const PEOPLE_PAGE_SIZE = 15;
