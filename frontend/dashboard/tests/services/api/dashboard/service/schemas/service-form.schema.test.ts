import { mapService } from "@/services/api/dashboard/shared/dashboard-mapper.util";
import { mapServicePayload } from "@/services/api/dashboard/shared/dashboard-payload-mapper.util";
import { serviceFormSchema } from "@/services/api/dashboard/service/schemas/service-form.schema";
import { describe, expect, it } from "vitest";

const catalogItemId = "0199d9a4-3c1e-7c2a-9f1b-6a2d4e8b1c3f";

const serviceInput = {
  name: { en: "Haircut", ar: "قص شعر" },
  price: 25,
  duration: 30,
  currencyId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
  active: true,
  atHome: false,
  serviceableId: "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f",
  serviceableType: "branch",
  catalogItemId,
} as const;

describe("serviceFormSchema catalog item contract", () => {
  it("links a UUID catalog item and sends it as catalog_item_id", () => {
    const parsed = serviceFormSchema.safeParse(serviceInput);

    expect(parsed.success).toBe(true);
    expect(
      parsed.success && mapServicePayload(parsed.data).catalog_item_id,
    ).toBe(catalogItemId);
  });

  it("rejects legacy integer catalog item ids", () => {
    expect(
      serviceFormSchema.safeParse({ ...serviceInput, catalogItemId: "42" })
        .success,
    ).toBe(false);
  });

  it("reads the UUID catalog item id back from the API", () => {
    expect(
      mapService({ id: "s1", catalog_item_id: catalogItemId }).catalogItemId,
    ).toBe(catalogItemId);
  });
});

describe("serviceFormSchema at-home flag", () => {
  it("sends atHome as at_home and reads it back from the API", () => {
    const parsed = serviceFormSchema.safeParse({
      ...serviceInput,
      atHome: true,
    });

    expect(parsed.success && mapServicePayload(parsed.data).at_home).toBe(true);
    expect(mapService({ id: "s1", at_home: true }).atHome).toBe(true);
  });
});
