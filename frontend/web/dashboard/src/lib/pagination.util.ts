export const FIRST_PAGE = 1;

/** Clamps an untrusted page number into the valid range. */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isInteger(page)) return FIRST_PAGE;
  return Math.min(Math.max(page, FIRST_PAGE), Math.max(totalPages, FIRST_PAGE));
}
