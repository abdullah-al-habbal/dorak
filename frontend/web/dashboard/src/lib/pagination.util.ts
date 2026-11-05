const FIRST_PAGE = 1;

/** Clamps an untrusted page number into the valid range. */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isInteger(page)) return FIRST_PAGE;
  return Math.min(Math.max(page, FIRST_PAGE), Math.max(totalPages, FIRST_PAGE));
}

/** Writes `page` into a query string, leaving other params alone; page 1 is the implicit default. */
export function withPage(search: string, page: number): string {
  const params = new URLSearchParams(search);
  if (page > FIRST_PAGE) params.set("page", String(page));
  else params.delete("page");
  return params.toString();
}
