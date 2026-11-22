import { describe, expect, it, vi } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { SubscriptionInterval } from "@/enums/money/subscription-interval.enum";
import { featureLabel, intervalLabel } from "@/lib/plans/subscription-format.util";

const { interval, features } = enDictionary.subscription;

describe("subscription format", () => {
  it("uses the singular unit for a count of one", () => {
    expect(intervalLabel(SubscriptionInterval.Month, 1, interval)).toBe("month");
  });

  it("uses the counted wording otherwise", () => {
    expect(intervalLabel(SubscriptionInterval.Month, 3, interval)).toBe("3 months");
  });

  it("labels known features and shows Unknown for a key without a label", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(featureLabel("multi_branch", features.labels, "Unknown")).toBe("Multiple branches");
    expect(featureLabel("loyalty_points", features.labels, "Unknown")).toBe("Unknown");
  });
});
