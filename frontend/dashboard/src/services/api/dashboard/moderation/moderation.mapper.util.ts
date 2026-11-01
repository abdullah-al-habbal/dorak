import {
  DisputedReviewSchema,
  ExchangeRateSchema,
} from "@/services/api/dashboard/moderation/schemas/moderation.schema";
import { parseReviewSubjectType } from "@/services/api/dashboard/review/review-enum.util";
import type { IDisputedReview } from "@/services/api/dashboard/moderation/types/idisputed-review.types";
import type { IExchangeRate } from "@/services/api/dashboard/moderation/types/iexchange-rate.types";
import { isRecord } from "@/utils/guards.util";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function nullableText(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}
function numeric(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

export function mapDisputedReview(wire: unknown): IDisputedReview {
  const item = record(wire);
  return DisputedReviewSchema.parse({
    id: text(item.id),
    rating: numeric(item.rating),
    comment: nullableText(item.comment),
    authorName: nullableText(item.author_name),
    subjectType: parseReviewSubjectType(item.subject_type),
    disputeReason: nullableText(item.dispute_reason),
    disputedAt: nullableText(item.disputed_at),
    createdAt: text(item.created_at),
  });
}

export function mapExchangeRate(wire: unknown): IExchangeRate {
  const item = record(wire);
  return ExchangeRateSchema.parse({
    id: text(item.id),
    fromCode: text(item.from_currency_code),
    toCode: text(item.to_currency_code),
    rateRatio: numeric(item.rate_ratio),
    effectiveAt: nullableText(item.effective_at),
  });
}
