import { describe, expect, it } from "vitest";

import { groupByCategory, UNCATEGORISED_KEY } from "@/lib/services/service-grouping.util";
import type { Service } from "@/types/services/service.type";

function service(id: string, category?: { id: string; name: string }): Service {
  return { id, name: id, serviceable_id: "b", serviceable_type: "brand", price_amount_minor: 100, currency_code: "USD", is_at_home: false, is_active: true, category };
}

describe("groupByCategory", () => {
  it("groups by category, sorts by name and puts uncategorised last", () => {
    const groups = groupByCategory([service("1"), service("2", { id: "z", name: "Beard" }), service("3", { id: "a", name: "Hair" }), service("4", { id: "z", name: "Beard" })], "en");
    expect(groups.map((group) => group.label)).toEqual(["Beard", "Hair", null]);
    expect(groups[0].services.map((item) => item.id)).toEqual(["2", "4"]);
    expect(groups[2].key).toBe(UNCATEGORISED_KEY);
  });

  it("returns no groups for no services", () => {
    expect(groupByCategory([], "en")).toEqual([]);
  });
});
