import { describe, expect, it } from "vitest";

import { platformAnalyticsSchema } from "@/schemas/platform-analytics.zod";
import { platformSettingListSchema, platformSettingValuesSchema } from "@/schemas/platform-setting.zod";
import { createPlatformSettingsSchema } from "@/schemas/platform-settings-form.zod";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { Locale } from "@/enums/locale.enum";

const analytics = {
  period: { from: "2026-03-01", to: "2026-03-31" },
  platform: { brands: 1, branches: 2, barbers: 3, clients: 4 },
  subscriptions: { by_plan: [{ plan_id: "p", plan_name: "Growth", subscriptions: 2 }], recurring_revenue: [{ currency: "USD", total_amount_minor: 100 }] },
  commission: { pending: [], settled: [] },
  payouts: [{ status: "paid", currency: "USD", payouts: 1, total_amount_minor: 5 }],
  completed_bookings: 3,
  bookings_by_status: [{ status: "completed", count: 3 }],
  completed_bookings_series: [{ date: "2026-03-10", count: 3 }],
};

describe("platform analytics schema", () => {
  it("accepts the overview payload", () => {
    expect(platformAnalyticsSchema.parse(analytics).subscriptions.by_plan[0]?.plan_name).toBe("Growth");
  });

  it("accepts an open period and rejects a missing section", () => {
    expect(platformAnalyticsSchema.safeParse({ ...analytics, period: { from: null, to: null } }).success).toBe(true);
    expect(platformAnalyticsSchema.safeParse({ ...analytics, commission: undefined }).success).toBe(false);
  });
});

describe("platform settings schemas", () => {
  const row = { setting_key: "explore_candidate_cap", group: "search", value_integer: 500, default: 500, min: 50, max: 1000 };

  it("parses the list and the save response", () => {
    expect(platformSettingListSchema.parse([row])[0]?.max).toBe(1000);
    expect(platformSettingValuesSchema.parse({ explore_candidate_cap: 600 })).toEqual({ explore_candidate_cap: 600 });
  });

  it("rejects an unknown group", () => {
    expect(platformSettingListSchema.safeParse([{ ...row, group: "other" }]).success).toBe(false);
  });

  it("validates the form against each setting's bounds with localized messages", () => {
    const messages = DICTIONARIES[Locale.En].settings.validation;
    const schema = createPlatformSettingsSchema(platformSettingListSchema.parse([row]), messages);
    expect(schema.safeParse({ explore_candidate_cap: "600" }).success).toBe(true);
    const bad = schema.safeParse({ explore_candidate_cap: "10" });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues[0]?.message).toBe("Enter a whole number from 50 to 1000.");
    expect(schema.safeParse({ explore_candidate_cap: "abc" }).error?.issues[0]?.message).toBe(messages.integer);
  });
});
