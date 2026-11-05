import { cancelBarberBookingFormSchema } from "@/services/api/barber-workspace/schemas/cancel-barber-booking-form.schema";
import { describe, expect, it } from "vitest";

describe("cancelBarberBookingFormSchema", () => {
  it("rejects an empty cancellation reason", () => {
    expect(
      cancelBarberBookingFormSchema.safeParse({ cancellationReason: "" })
        .success,
    ).toBe(false);
  });
  it("accepts a non-empty cancellation reason", () => {
    expect(
      cancelBarberBookingFormSchema.safeParse({
        cancellationReason: "No-show",
      }).success,
    ).toBe(true);
  });
});
