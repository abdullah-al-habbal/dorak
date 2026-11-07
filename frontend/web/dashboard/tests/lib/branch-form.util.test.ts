import { describe, expect, it } from "vitest";

import { BranchStatus } from "@/enums/branch-status.enum";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { branchToForm, emptyBranchForm, formToBranchPayload, selectableStatuses } from "@/lib/branch-form.util";
import type { BranchDetail } from "@/types/branch-detail.type";

const detail: BranchDetail = {
  id: "br1",
  brand_id: "b1",
  name: { en: "Downtown", ar: "وسط المدينة" },
  email: "downtown@example.test",
  status: BranchStatus.Disabled,
  universe: VenueUniverse.Women,
  description: { en: "Calm", ar: null },
  address: null,
  latitude: "24.7136000",
  longitude: 46.6753,
};

describe("branch form helpers", () => {
  it("loads both translations and coordinates into the form, with a blank password", () => {
    const form = branchToForm(detail);
    expect(form).toMatchObject({ name_en: "Downtown", name_ar: "وسط المدينة", description_en: "Calm", description_ar: "", address_en: "", latitude: "24.7136000", longitude: "46.6753", password: "" });
  });

  it("starts a new branch enabled, unisex and for the given brand", () => {
    expect(emptyBranchForm("b9")).toMatchObject({ brand_id: "b9", status: BranchStatus.Enabled, universe: VenueUniverse.Unisex, password: "" });
  });

  it("builds the payload: trimmed text, null for empty translations and coordinates", () => {
    const payload = formToBranchPayload({ ...emptyBranchForm("b1"), name_en: " A ", name_ar: " ب ", email: " a@b.test ", description_ar: "وصف" });
    expect(payload).toEqual({
      brand_id: "b1",
      name: { en: "A", ar: "ب" },
      email: "a@b.test",
      status: BranchStatus.Enabled,
      universe: VenueUniverse.Unisex,
      description: { en: "", ar: "وصف" },
      address: null,
      latitude: null,
      longitude: null,
    });
  });

  it("sends a password only when one was typed, and never sends hours, tags or the floor plan", () => {
    const withPassword = formToBranchPayload({ ...branchToForm(detail), password: "a-new-secure-password" });
    expect(withPassword.password).toBe("a-new-secure-password");
    const without = formToBranchPayload(branchToForm(detail));
    expect("password" in without).toBe(false);
    expect(Object.keys(without)).not.toEqual(expect.arrayContaining(["opening_hours", "tags", "floor_plan_zones"]));
    expect(without.latitude).toBe(24.7136);
  });

  it("offers pending only while a branch is still pending", () => {
    expect(selectableStatuses(BranchStatus.Enabled)).toEqual([BranchStatus.Enabled, BranchStatus.Disabled]);
    expect(selectableStatuses(BranchStatus.Pending)).toContain(BranchStatus.Pending);
  });
});
