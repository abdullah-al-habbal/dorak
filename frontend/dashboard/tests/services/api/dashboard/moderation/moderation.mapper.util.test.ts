import { describe, expect, it } from "vitest";
import {
  mapDisputedReview,
  mapExchangeRate,
} from "@/services/api/dashboard/moderation/moderation.mapper.util";

describe("moderation mappers", () => {
  it("maps a disputed review with its dispute reason", () => {
    expect(
      mapDisputedReview({
        id: "r1",
        rating: 2,
        comment: "Rude",
        author_name: "Sam",
        subject_type: "branch",
        dispute_reason: "Wrong appointment",
        disputed_at: "2026-10-28T10:00:00+00:00",
        created_at: "2026-10-27T10:00:00+00:00",
      }),
    ).toEqual({
      id: "r1",
      rating: 2,
      comment: "Rude",
      authorName: "Sam",
      subjectType: "branch",
      disputeReason: "Wrong appointment",
      disputedAt: "2026-10-28T10:00:00+00:00",
      createdAt: "2026-10-27T10:00:00+00:00",
    });
  });

  it("tolerates a sparse review payload", () => {
    const review = mapDisputedReview({ id: "r2" });
    expect(review.comment).toBeNull();
    expect(review.disputeReason).toBeNull();
    expect(review.rating).toBe(0);
  });

  it("maps exchange rates with currency codes and a decimal-string rate", () => {
    expect(
      mapExchangeRate({
        id: "x1",
        from_currency_code: "USD",
        to_currency_code: "SAR",
        rate: "3.7500",
        effective_at: null,
      }),
    ).toEqual({
      id: "x1",
      fromCode: "USD",
      toCode: "SAR",
      rate: 3.75,
      effectiveAt: null,
    });
  });
});
