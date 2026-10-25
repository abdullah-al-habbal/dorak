import { ApiClientError } from "@/services/api/core/client-error";
import { chairConflictBookingIds } from "@/services/api/dashboard/chair/chair-maintenance-conflict.util";
import { describe, expect, it } from "vitest";

describe("chairConflictBookingIds", () => {
  it("returns the conflicting booking ids from a chair conflict", () => {
    const error = new ApiClientError(
      "Conflict",
      409,
      "CHAIR_HAS_ACTIVE_BOOKINGS",
      { booking_ids: ["a", "b"] },
    );
    expect(chairConflictBookingIds(error)).toEqual(["a", "b"]);
  });

  it("ignores other failures", () => {
    expect(
      chairConflictBookingIds(new ApiClientError("Conflict", 409, "OTHER")),
    ).toBeNull();
    expect(
      chairConflictBookingIds(
        new ApiClientError("Bad", 422, "CHAIR_HAS_ACTIVE_BOOKINGS"),
      ),
    ).toBeNull();
    expect(chairConflictBookingIds(new Error("x"))).toBeNull();
  });
});
