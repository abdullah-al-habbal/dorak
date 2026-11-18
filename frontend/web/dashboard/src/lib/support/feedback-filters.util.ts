import { FEEDBACK_FILTER_ALL, FEEDBACK_MAX_SEARCH } from "@/config/support/feedback.constant";
import { FeedbackApp } from "@/enums/support/feedback-app.enum";
import { FeedbackKind } from "@/enums/support/feedback-kind.enum";
import { FeedbackPlatform } from "@/enums/support/feedback-platform.enum";
import { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";

const SELECT_FILTERS = [
  { key: "kind", values: Object.values(FeedbackKind) },
  { key: "status", values: Object.values(FeedbackStatus) },
  { key: "app", values: Object.values(FeedbackApp) },
  { key: "platform", values: Object.values(FeedbackPlatform) },
] as const;

function parseOption<T extends string>(values: readonly T[], value: string | null): T | typeof FEEDBACK_FILTER_ALL {
  return values.find((candidate) => candidate === value) ?? FEEDBACK_FILTER_ALL;
}

export function feedbackFiltersFromParams(params: URLSearchParams): FeedbackFilters {
  const page = Number(params.get("page"));
  return {
    kind: parseOption(Object.values(FeedbackKind), params.get("kind")),
    status: parseOption(Object.values(FeedbackStatus), params.get("status")),
    app: parseOption(Object.values(FeedbackApp), params.get("app")),
    platform: parseOption(Object.values(FeedbackPlatform), params.get("platform")),
    search: params.get("search")?.trim().slice(0, FEEDBACK_MAX_SEARCH) || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** The same params the screen reads back and the API receives: `all` sends nothing. */
export function feedbackFiltersToParams(filters: FeedbackFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const { key } of SELECT_FILTERS) {
    if (filters[key] !== FEEDBACK_FILTER_ALL) params.set(key, filters[key]);
  }
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function feedbackQueryString(filters: FeedbackFilters, perPage: number): string {
  const params = feedbackFiltersToParams(filters);
  params.set("per_page", String(perPage));
  params.set("page", String(filters.page));
  return params.toString();
}

export function hasFeedbackFilters(filters: FeedbackFilters): boolean {
  return SELECT_FILTERS.some(({ key }) => filters[key] !== FEEDBACK_FILTER_ALL) || filters.search !== undefined;
}
