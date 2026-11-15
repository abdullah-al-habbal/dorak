import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { SubscriptionInterval } from "@/enums/subscription-interval.enum";
import { featureLabel, intervalLabel } from "@/lib/subscription-format.util";

const { interval, features } = enDictionary.subscription;

describe("subscription format", () => {
  it("uses the singular unit for a count of one", () => {
    expect(intervalLabel(SubscriptionInterval.Month, 1, interval)).toBe("month");
  });

  it("uses the counted wording otherwise", () => {
    expect(intervalLabel(SubscriptionInterval.Month, 3, interval)).toBe("3 months");
  });

  it("labels known features and humanises unknown keys", () => {
    expect(featureLabel("multi_branch", features.labels)).toBe("Multiple branches");
    expect(featureLabel("loyalty_points", features.labels)).toBe("Loyalty points");
  });
});
