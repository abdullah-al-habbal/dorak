import { describe, expect, it } from "vitest";
import { bookingClientReviewSchema } from "@/services/api/dashboard/booking/schemas/booking-client-review.schema";

describe("bookingClientReviewSchema", () => {
  it("accepts a rating from 1 to 5 with an optional comment", () => {
    expect(bookingClientReviewSchema.parse({ rating: "4" })).toEqual({
      rating: 4,
    });
    expect(
      bookingClientReviewSchema.parse({ rating: 1, body: " Late " }),
    ).toEqual({ rating: 1, body: "Late" });
  });

  it.each([0, 6, 2.5])("rejects the rating %s", (rating) => {
    expect(bookingClientReviewSchema.safeParse({ rating }).success).toBe(false);
  });
});
