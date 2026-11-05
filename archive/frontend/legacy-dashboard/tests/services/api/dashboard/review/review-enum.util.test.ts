import { describe, expect, it } from "vitest";
import { mapDisputedReview } from "@/services/api/dashboard/moderation/moderation.mapper.util";
import { DISPUTE_RESOLUTIONS } from "@/services/api/dashboard/moderation/moderation.constant";
import { mapBranchReview } from "@/services/api/dashboard/review/review.query";
import {
  parseReviewStatus,
  parseReviewSubjectType,
} from "@/services/api/dashboard/review/review-enum.util";

describe("review enums", () => {
  it("accepts backend statuses and subject types", () => {
    expect(parseReviewStatus("disputed")).toBe("disputed");
    expect(parseReviewSubjectType("barber")).toBe("barber");
  });

  it("maps unknown values to null", () => {
    expect(parseReviewStatus("archived")).toBeNull();
    expect(parseReviewSubjectType(7)).toBeNull();
  });

  it("limits dispute resolutions to published and hidden", () => {
    expect([...DISPUTE_RESOLUTIONS]).toEqual(["published", "hidden"]);
  });

  it("maps review wire payloads without leaking unknown enum values", () => {
    expect(mapBranchReview({ id: "1", status: "weird" }).status).toBeNull();
    expect(
      mapDisputedReview({ id: "1", subject_type: "branch", created_at: "x" })
        .subjectType,
    ).toBe("branch");
  });
});
