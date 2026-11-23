import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ApplicationStatus } from "@/enums/booking/application-status.enum";
import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { AffiliationStatus } from "@/enums/people/affiliation-status.enum";
import { BarberStatus } from "@/enums/people/barber-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { ReviewStatus } from "@/enums/people/review-status.enum";
import { BranchStatus } from "@/enums/venue/branch-status.enum";
import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { ChairStatus } from "@/enums/venue/chair-status.enum";

/**
 * D2 drift guard: backend/tests/Fixtures/wire-enums.json is kept equal to the backend enums by a Pest test
 * (WireEnumFixtureTest). A backend case with no dashboard value, or a dashboard value the backend does not
 * send, fails here.
 */
const FIXTURE_PATH = resolve(__dirname, "../../../../../backend/tests/Fixtures/wire-enums.json");
const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf-8")) as Record<string, string[]>;

const MIRRORS: Record<string, Record<string, string>> = {
  ApplicationStatus,
  AffiliationStatus,
  BarberStatus,
  BookingStatus,
  BranchStatus,
  BrandStatus,
  ChairStatus,
  FloorZone,
  ReviewStatus,
};

describe("dashboard enums mirror the backend wire enums", () => {
  for (const [name, mirror] of Object.entries(MIRRORS)) {
    it(`${name} has exactly the backend values`, () => {
      expect(Object.values(mirror).sort()).toEqual([...(fixture[name] ?? [])].sort());
    });
  }
});
