import { describe, expect, it } from "vitest";

import { chairListSchema, chairSchema } from "@/schemas/chairs/chair.zod";
import { hoursOverrideInputSchema, hoursOverrideSchema } from "@/schemas/hours/hours-override.zod";
import { openingHoursSchema } from "@/schemas/hours/opening-hours.zod";
import { optionalTranslationSchema } from "@/schemas/core/api/optional-translation.zod";
import { paymentGatewaySchema } from "@/schemas/platform/payment-gateway.zod";
import { floorPlanSchema } from "@/schemas/chairs/floor-plan.zod";
import { stylistSchema } from "@/schemas/stylists/stylist.zod";

describe("hours overrides", () => {
  it("reads a closure day and a special-hours day", () => {
    expect(hoursOverrideSchema.parse({ date: "2026-12-25", is_closed: true, opens_time: null, closes_time: null }).is_closed).toBe(true);
    expect(hoursOverrideSchema.safeParse({ date: "2026-12-25", is_closed: false }).success).toBe(false);
  });

  it("accepts a closed body or one valid interval only", () => {
    expect(hoursOverrideInputSchema.safeParse({ is_closed: true }).success).toBe(true);
    expect(hoursOverrideInputSchema.safeParse({ is_closed: false, opens_time: "09:00", closes_time: "17:30" }).success).toBe(true);
    for (const body of [{ is_closed: false }, { is_closed: false, opens_time: "9:00", closes_time: "17:00" }, { is_closed: false, opens_time: "24:00", closes_time: "25:00" }, { is_closed: false, opens_time: "09:60", closes_time: "17:00" }]) {
      expect(hoursOverrideInputSchema.safeParse(body).success, JSON.stringify(body)).toBe(false);
    }
  });
});

describe("opening hours", () => {
  it("trims times to HH:mm and defaults missing shifts", () => {
    const parsed = openingHoursSchema.parse({
      opening_hours: [
        { day_of_week: 1, is_closed: false, shifts: [{ opens_time: "09:00:00", closes_time: "17:30:00" }] },
        { day_of_week: 0, is_closed: true },
      ],
    });
    expect(parsed.opening_hours[0].shifts).toEqual([{ opens_time: "09:00", closes_time: "17:30" }]);
    expect(parsed.opening_hours[1].shifts).toEqual([]);
  });

  it("rejects a day outside the week and a malformed time", () => {
    expect(openingHoursSchema.safeParse({ opening_hours: [{ day_of_week: 7, is_closed: true }] }).success).toBe(false);
    expect(openingHoursSchema.safeParse({ opening_hours: [{ day_of_week: 1, is_closed: false, shifts: [{ opens_time: "9", closes_time: "17:00" }] }] }).success).toBe(false);
  });
});

describe("optional translations", () => {
  it("reads Laravel's empty array as no text", () => {
    expect(optionalTranslationSchema.parse([])).toBeNull();
    expect(optionalTranslationSchema.parse(null)).toBeNull();
    expect(optionalTranslationSchema.parse({ en: "Hi", ar: "مرحبا" })).toEqual({ en: "Hi", ar: "مرحبا" });
  });
});

describe("payment gateway", () => {
  const base = { id: "g1", code: "offline", name: { en: "Offline", ar: "نقدي" }, driver: "offline", is_active: true, is_default: false };

  it("defaults the setting keys and order, and never carries a secret", () => {
    const parsed = paymentGatewaySchema.parse({ ...base, api_secret: "leak" });
    expect(parsed).toMatchObject({ gateway_setting_keys: [], sort_order: 0 });
    expect(parsed).not.toHaveProperty("api_secret");
  });

  it("rejects an unknown driver", () => {
    expect(paymentGatewaySchema.safeParse({ ...base, driver: "stripe" }).success).toBe(false);
  });
});

describe("chair and stylist rows", () => {
  it("fills layout defaults the way the editor expects", () => {
    expect(chairSchema.parse({ id: "c1", layout_settings: {} }).layout_settings).toEqual({ position_x: 0, position_y: 0, width: 60, height: 60 });
    expect(chairListSchema.parse([{ id: "c1" }])[0].layout_settings).toBeUndefined();
  });

  it("rejects an unknown chair status or zone", () => {
    expect(chairSchema.safeParse({ id: "c1", status: "broken" }).success).toBe(false);
    expect(chairSchema.safeParse({ id: "c1", floor_zone: "balcony" }).success).toBe(false);
  });

  it("defaults a stylist's rating count and requires a known status", () => {
    const stylist = stylistSchema.parse({ id: "s1", name: "Sam", status: "enabled" });
    expect(stylist.rating_count).toBe(0);
    expect(stylistSchema.safeParse({ id: "s1", name: "Sam", status: "gone" }).success).toBe(false);
  });
});

describe("floor plan", () => {
  it("defaults zones and decorations and keeps a null preset", () => {
    const plan = floorPlanSchema.parse({ branch_id: "b1", chairs: [], floor_plan: { preset: null, canvas: { width: 20, height: 10, unit: "m" } } });
    expect(plan.floor_plan.zones).toEqual([]);
    expect(plan.floor_plan.decorations).toEqual([]);
  });

  it("rejects an unknown preset, canvas unit or decoration type", () => {
    const canvas = { width: 20, height: 10, unit: "m" };
    expect(floorPlanSchema.safeParse({ branch_id: "b", chairs: [], floor_plan: { preset: "weird", canvas } }).success).toBe(false);
    expect(floorPlanSchema.safeParse({ branch_id: "b", chairs: [], floor_plan: { preset: null, canvas: { ...canvas, unit: "km" } } }).success).toBe(false);
    expect(floorPlanSchema.safeParse({ branch_id: "b", chairs: [], floor_plan: { preset: null, canvas, decorations: [{ type: "fountain", x: 0, y: 0, width: 1, height: 1 }] } }).success).toBe(false);
  });
});
