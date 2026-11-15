import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { activeTogglePayload, emptyServiceForm, formToServicePayload, newServiceOwner, serviceToForm } from "@/lib/service-form.util";
import { withServiceActive } from "@/lib/service-cache.util";
import { formatDuration, formatServicePrice } from "@/lib/service-format.util";
import { createServiceSchema } from "@/schemas/service-form.zod";
import type { Service } from "@/types/services/service.type";

const SERVICE: Service = {
  id: "s1", name: "Haircut", name_translations: { en: "Haircut", ar: "قص شعر" }, serviceable_id: "b1", serviceable_type: "brand", catalog_item_id: "c1",
  price_amount_minor: 2550, currency_code: "USD", duration_minutes: 45, is_at_home: true, is_active: true,
};
const messages = enDictionary.services.form.validation;

describe("service form", () => {
  it("validates price, currency and duration", () => {
    const schema = createServiceSchema(messages);
    const valid = { ...emptyServiceForm("USD"), name_en: "Cut", name_ar: "قص", price: "25.50", duration: "30" };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, price: "-1" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, duration: "2000" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, duration: "" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, currency_code: "" }).success).toBe(false);
  });

  it("converts the form to minor units with a null duration when empty", () => {
    const payload = formToServicePayload({ ...emptyServiceForm("USD"), name_en: "Cut", name_ar: "قص", price: "25.5" }, newServiceOwner("b1"));
    expect(payload).toMatchObject({ price_amount_minor: 2550, duration_minutes: null, serviceable_id: "b1", serviceable_type: "brand", catalog_item_id: null });
  });

  it("round-trips an existing service and keeps its owner and catalog item when toggling", () => {
    expect(serviceToForm(SERVICE)).toMatchObject({ name_en: "Haircut", name_ar: "قص شعر", price: "25.50", duration: "45" });
    expect(activeTogglePayload(SERVICE, false)).toMatchObject({ is_active: false, price_amount_minor: 2550, catalog_item_id: "c1", serviceable_id: "b1", is_at_home: true });
  });

  it("sends the chosen category, or null for none, and leaves it out when only toggling", () => {
    const owner = newServiceOwner("b1");
    const base = { ...emptyServiceForm("USD"), name_en: "Cut", name_ar: "قص", price: "10" };
    expect(formToServicePayload({ ...base, category_id: "cat1" }, owner).category_id).toBe("cat1");
    expect(formToServicePayload(base, owner).category_id).toBeNull();
    expect(serviceToForm({ ...SERVICE, category: { id: "cat9", name: "Hair" } }).category_id).toBe("cat9");
    expect(JSON.parse(JSON.stringify(activeTogglePayload(SERVICE, false)))).not.toHaveProperty("category_id");
  });

  it("flips the active flag in cached lists only for the matching service", () => {
    const next = withServiceActive([SERVICE, { ...SERVICE, id: "s2" }], "s2", false);
    expect(next?.map((service) => service.is_active)).toEqual([true, false]);
    expect(withServiceActive([SERVICE], "zzz", false)).toEqual([SERVICE]);
    expect(withServiceActive(undefined, "s1", false)).toBeUndefined();
  });

  it("formats durations and free prices from the dictionary", () => {
    expect(formatDuration(90, enDictionary)).toBe("1 h 30 min");
    expect(formatDuration(45, enDictionary)).toBe("45 min");
    expect(formatDuration(60, enDictionary)).toBe("1 h");
    expect(formatServicePrice(0, "USD", "en", enDictionary)).toBe("Free");
    expect(formatServicePrice(2550, "USD", "en", enDictionary)).toContain("25.50");
  });
});
