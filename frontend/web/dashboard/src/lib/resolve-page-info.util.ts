import { pageInfoSchema } from "@/schemas/page-info.zod";
import type { PageInfo } from "@/types/page-info.type";

const SINGLE_PAGE = 1;

/** Reads `meta.pagination`; a missing or malformed block falls back to a single page of what was returned. */
export function resolvePageInfo(meta: unknown, itemCount: number, perPage: number, page: number): PageInfo {
  const body = (meta ?? {}) as { pagination?: unknown };
  const parsed = pageInfoSchema.safeParse(body.pagination);
  if (parsed.success) return parsed.data;
  return { total: itemCount, per_page: perPage, current_page: page, total_pages: SINGLE_PAGE };
}
