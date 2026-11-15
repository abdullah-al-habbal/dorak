import { describe, expect, it } from "vitest";

import { mapBookingFormError } from "@/lib/booking-form-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const MESSAGES = { conflict: "conflict", outsideSchedule: "outside", generic: "generic" };

describe("mapBookingFormError", () => {
  it("maps 409 to the start field", () => {
    const error = new ApiClientError({ status: 409, code: "BOOKING_SLOT_CONFLICT", message: "raw" });
    expect(mapBookingFormError(error, MESSAGES, "starts_at")).toEqual({ fieldErrors: { starts_at: "conflict" } });
  });

  it("maps the outside-schedule code to the start field", () => {
    const error = new ApiClientError({ status: 422, code: "booking_outside_schedule", message: "raw" });
    expect(mapBookingFormError(error, MESSAGES, "starts_at").fieldErrors.starts_at).toBe("outside");
  });

  it("maps backend field errors, collapsing array indexes", () => {
    const error = new ApiClientError({ status: 422, code: "validation_error", message: "raw", fields: { "service_ids.0": ["bad"], customer_email: ["invalid"] } });
    expect(mapBookingFormError(error, MESSAGES, "starts_at").fieldErrors).toEqual({ service_ids: "bad", customer_email: "invalid" });
  });

  it("falls back to a form-level message", () => {
    expect(mapBookingFormError(new Error("x"), MESSAGES, "starts_at")).toEqual({ fieldErrors: {}, formError: "generic" });
  });
});
