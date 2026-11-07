import { describe, expect, it } from "vitest";

import { reviewListSchema, reviewSummarySchema } from "@/schemas/review.zod";

describe("review schemas", () => {
  it("accepts a backend review row with an unknown extra field", () => {
    const rows = reviewListSchema.parse([{ id: "r1", rating: 5, body: null, status: "published", author_name: "Sami", created_at: "2026-11-01T10:00:00+00:00", subject_id: "x" }]);
    expect(rows[0]?.status).toBe("published");
  });

  it("rejects an unknown status", () => {
    expect(reviewListSchema.safeParse([{ id: "r1", rating: 5, status: "weird", created_at: "t" }]).success).toBe(false);
  });

  it("accepts a null average for an empty branch", () => {
    expect(reviewSummarySchema.safeParse({ average: null, count: 0, distribution: { "1": 0 } }).success).toBe(true);
  });
});
