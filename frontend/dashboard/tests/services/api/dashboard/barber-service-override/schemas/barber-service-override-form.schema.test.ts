import { describe, expect, it } from "vitest";
import { barberServiceOverrideFormSchema } from "@/services/api/dashboard/barber-service-override/schemas/barber-service-override-form.schema";

describe("barberServiceOverrideFormSchema", () => {
  it("accepts a price, a duration, or both", () => {
    expect(
      barberServiceOverrideFormSchema.parse({
        price: "35",
        durationMinutes: "",
      }),
    ).toEqual({ price: 35, durationMinutes: null });
    expect(
      barberServiceOverrideFormSchema.parse({
        price: "",
        durationMinutes: "45",
      }),
    ).toEqual({ price: null, durationMinutes: 45 });
    expect(
      barberServiceOverrideFormSchema.parse({ price: 10, durationMinutes: 30 }),
    ).toEqual({ price: 10, durationMinutes: 30 });
  });

  it("rejects a form that overrides nothing", () => {
    expect(
      barberServiceOverrideFormSchema.safeParse({
        price: "",
        durationMinutes: "",
      }).success,
    ).toBe(false);
  });

  it("rejects a negative price and an out-of-range duration", () => {
    expect(
      barberServiceOverrideFormSchema.safeParse({
        price: -1,
        durationMinutes: "",
      }).success,
    ).toBe(false);
    expect(
      barberServiceOverrideFormSchema.safeParse({
        price: "",
        durationMinutes: 0,
      }).success,
    ).toBe(false);
    expect(
      barberServiceOverrideFormSchema.safeParse({
        price: "",
        durationMinutes: 1441,
      }).success,
    ).toBe(false);
  });
});
