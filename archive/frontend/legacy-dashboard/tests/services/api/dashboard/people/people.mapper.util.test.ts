import { describe, expect, it } from "vitest";
import {
  mapAffiliation,
  mapApplication,
  mapJobPosting,
} from "@/services/api/dashboard/people/people.mapper.util";

describe("people mappers", () => {
  it("maps an affiliation and detects shop-initiated invites", () => {
    const mapped = mapAffiliation({
      id: "a1",
      barber_id: "b1",
      barber_name: { en: "Sam", ar: "سام" },
      status: "pending",
      initiated_by_type: "Modules\\Branch\\Models\\BranchModel",
      commission_percent: "12.5",
      created_at: "2026-10-28T00:00:00Z",
    });

    expect(mapped).toMatchObject({
      barberName: "Sam",
      status: "pending",
      initiatedByBranch: true,
      commissionPercent: 12.5,
    });
    expect(
      mapAffiliation({ initiated_by_type: "barber" }).initiatedByBranch,
    ).toBe(false);
  });

  it("falls back on malformed affiliation input", () => {
    expect(mapAffiliation(null)).toMatchObject({
      id: "",
      status: "pending",
      barberName: null,
    });
  });

  it("maps a job posting", () => {
    expect(
      mapJobPosting({
        id: "j1",
        title: { en: "Barber", ar: "حلاق" },
        description: { en: "d", ar: "و" },
        status: "closed",
        applications_count: 3,
        employment_type: "full-time",
      }),
    ).toMatchObject({
      status: "closed",
      applicationsCount: 3,
      location: null,
      employmentType: "full-time",
    });
  });

  it("maps the Task 56 snapshot fields of an application", () => {
    const mapped = mapApplication({
      id: "x",
      status: "seen",
      created_at: "2026-10-28T00:00:00Z",
      profile_snapshot: {
        name: "Sam",
        bio: "Fades",
        rating: { average: 4.5, count: 10 },
        portfolio: [{ id: "p" }, { id: "q" }],
        services: [{ name: { en: "Cut", ar: "قص" } }, { name: "Shave" }],
      },
    });

    expect(mapped).toMatchObject({
      applicantName: "Sam",
      bio: "Fades",
      ratingAverage: 4.5,
      ratingCount: 10,
      portfolioCount: 2,
      serviceNames: ["Cut", "Shave"],
    });
  });
});
