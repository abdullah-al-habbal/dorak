import { describe, expect, it } from "vitest";
import { mapStylist } from "@/services/api/dashboard/shared/dashboard-mapper.util";
import { STYLIST_STATUSES } from "@/services/api/dashboard/stylist/stylist.constant";
import { stylistCreateSchema } from "@/services/api/dashboard/stylist/schemas/stylist-form.schema";

describe("stylist status", () => {
  it("mirrors the backend BarberStatusEnum", () => {
    expect([...STYLIST_STATUSES]).toEqual(["pending", "enabled", "disabled"]);
  });

  it("falls back to pending for an unknown wire status", () => {
    expect(mapStylist({ id: "1", status: "banned" }).status).toBe("pending");
    expect(mapStylist({ id: "1", status: "enabled" }).status).toBe("enabled");
  });

  it("rejects statuses outside the enum in the form schema", () => {
    const base = {
      name: { en: "Ann", ar: "آن" },
      email: "a@b.co",
      phone: null,
      chairId: null,
      password: "a-long-password-1",
    };
    expect(
      stylistCreateSchema.safeParse({ ...base, status: "banned" }).success,
    ).toBe(false);
    expect(
      stylistCreateSchema.safeParse({ ...base, status: "enabled" }).success,
    ).toBe(true);
  });
});
