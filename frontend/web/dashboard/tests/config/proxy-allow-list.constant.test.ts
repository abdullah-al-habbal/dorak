import { describe, expect, it } from "vitest";

import { PROXY_ALLOW_LIST } from "@/config/proxy-allow-list.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { HttpMethod } from "@/enums/http-method.enum";

function allowed(method: HttpMethod, path: string, guard: AuthActor): boolean {
  return PROXY_ALLOW_LIST.some((rule) => rule.methods.includes(method) && rule.pattern.test(path) && rule.guards.includes(guard));
}

describe("proxy allow-list: chairs", () => {
  it.each([
    [HttpMethod.Get, "chairs"],
    [HttpMethod.Post, "chairs"],
    [HttpMethod.Get, "chairs/abc"],
    [HttpMethod.Put, "chairs/abc"],
    [HttpMethod.Delete, "chairs/abc"],
  ])("lets the manager %s %s", (method, path) => {
    expect(allowed(method, path, AuthActor.Manager)).toBe(true);
  });

  it("keeps barbers out and rejects nested or unsupported calls", () => {
    expect(allowed(HttpMethod.Get, "chairs", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Patch, "chairs/abc", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, "chairs/abc/extra", AuthActor.Manager)).toBe(false);
  });
});

describe("proxy allow-list: branch reviews", () => {
  it("allows reads for the manager only on the reviews path", () => {
    expect(allowed(HttpMethod.Get, "branches/b1/reviews", AuthActor.Manager)).toBe(true);
    expect(allowed(HttpMethod.Post, "branches/b1/reviews", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, "branches/b1/reviews", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, "branches/b1/reviews/r1", AuthActor.Manager)).toBe(false);
  });
});

describe("proxy allow-list: owner payouts and subscription", () => {
  it.each(["payouts", "subscription"])("allows only the owner to read %s", (path) => {
    expect(allowed(HttpMethod.Get, path, AuthActor.Owner)).toBe(true);
    expect(allowed(HttpMethod.Get, path, AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, path, AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, path, AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Post, path, AuthActor.Owner)).toBe(false);
  });

  it("does not expose the admin payout or plan routes", () => {
    expect(allowed(HttpMethod.Get, "admin/payouts", AuthActor.Owner)).toBe(false);
    expect(allowed(HttpMethod.Get, "payouts/p1", AuthActor.Owner)).toBe(false);
  });
});

describe("proxy allow-list: branch management", () => {
  it("lets admins and owners create and delete branches, but not managers or barbers", () => {
    for (const actor of [AuthActor.Admin, AuthActor.Owner]) {
      expect(allowed(HttpMethod.Post, "branches", actor)).toBe(true);
      expect(allowed(HttpMethod.Delete, "branches/b1", actor)).toBe(true);
    }
    for (const actor of [AuthActor.Manager, AuthActor.Barber]) {
      expect(allowed(HttpMethod.Post, "branches", actor)).toBe(false);
      expect(allowed(HttpMethod.Delete, "branches/b1", actor)).toBe(false);
    }
  });

  it("keeps reads and updates open to the operations guards", () => {
    expect(allowed(HttpMethod.Get, "branches", AuthActor.Owner)).toBe(true);
    expect(allowed(HttpMethod.Get, "branches/b1", AuthActor.Admin)).toBe(true);
    expect(allowed(HttpMethod.Put, "branches/b1", AuthActor.Manager)).toBe(true);
    expect(allowed(HttpMethod.Post, "branches/b1", AuthActor.Owner)).toBe(false);
    expect(allowed(HttpMethod.Delete, "branches/b1/opening-hours", AuthActor.Owner)).toBe(false);
  });

  it("opens the brand picker to admins and owners only, read-only", () => {
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Owner)).toBe(true);
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Admin)).toBe(true);
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Post, "brands", AuthActor.Owner)).toBe(false);
    expect(allowed(HttpMethod.Get, "brands/b1", AuthActor.Owner)).toBe(false);
  });
});

describe("proxy allow-list: barber schedule", () => {
  it.each(["schedule/appointments", "schedule/hours"])("lets only the barber read %s", (path) => {
    expect(allowed(HttpMethod.Get, path, AuthActor.Barber)).toBe(true);
    for (const guard of [AuthActor.Admin, AuthActor.Manager, AuthActor.Owner]) {
      expect(allowed(HttpMethod.Get, path, guard)).toBe(false);
    }
  });

  it("is read-only and exact", () => {
    expect(allowed(HttpMethod.Post, "schedule/hours", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Patch, "schedule/appointments", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, "schedule", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, "schedule/appointments/extra", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, "bookings", AuthActor.Barber)).toBe(false);
  });
});

describe("proxy allow-list: admin billing (Module 9)", () => {
  it.each([
    [HttpMethod.Get, "admin/payouts"],
    [HttpMethod.Post, "admin/payouts/generate"],
    [HttpMethod.Patch, "admin/payouts/p1/approve"],
    [HttpMethod.Patch, "admin/payouts/p1/mark-paid"],
    [HttpMethod.Patch, "admin/payouts/p1/cancel"],
    [HttpMethod.Get, "admin/subscription-plans"],
    [HttpMethod.Post, "admin/subscription-plans"],
    [HttpMethod.Put, "admin/subscription-plans/pl1"],
    [HttpMethod.Delete, "admin/subscription-plans/pl1"],
    [HttpMethod.Get, "admin/plan-feature-keys"],
    [HttpMethod.Get, "admin/subscriptions"],
    [HttpMethod.Post, "admin/subscriptions"],
    [HttpMethod.Patch, "admin/subscriptions/s1/status"],
  ])("lets only the admin %s %s", (method, path) => {
    expect(allowed(method, path, AuthActor.Admin)).toBe(true);
    for (const actor of [AuthActor.Manager, AuthActor.Barber, AuthActor.Owner]) expect(allowed(method, path, actor)).toBe(false);
  });

  it("keeps everything else under admin closed", () => {
    expect(allowed(HttpMethod.Delete, "admin/payouts/p1", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Put, "admin/payouts/p1/approve", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Patch, "admin/payouts/p1/refund", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Delete, "admin/subscriptions/s1", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Get, "admin/payment-gateways", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Get, "admin/payouts/p1", AuthActor.Admin)).toBe(false);
  });
});

describe("proxy allow-list: analytics and settings (Module 10)", () => {
  it.each([
    [HttpMethod.Get, "admin/analytics/overview"],
    [HttpMethod.Get, "admin/settings"],
    [HttpMethod.Patch, "admin/settings"],
  ])("lets only the admin %s %s", (method, path) => {
    expect(allowed(method, path, AuthActor.Admin)).toBe(true);
    for (const actor of [AuthActor.Manager, AuthActor.Barber, AuthActor.Owner]) expect(allowed(method, path, actor)).toBe(false);
  });

  it("keeps the rest of the settings surface closed", () => {
    expect(allowed(HttpMethod.Put, "admin/settings", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Post, "admin/analytics/overview", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Get, "admin/analytics", AuthActor.Admin)).toBe(false);
  });
});

describe("proxy allow-list: brand approval", () => {
  it("lets only admins read a brand's detail and approve it", () => {
    expect(allowed(HttpMethod.Get, "brands/b1", AuthActor.Admin)).toBe(true);
    expect(allowed(HttpMethod.Patch, "admin/brands/b1/approve", AuthActor.Admin)).toBe(true);
    for (const actor of [AuthActor.Owner, AuthActor.Manager, AuthActor.Barber]) {
      expect(allowed(HttpMethod.Get, "brands/b1", actor)).toBe(false);
      expect(allowed(HttpMethod.Patch, "admin/brands/b1/approve", actor)).toBe(false);
    }
  });

  it("keeps the brand list for admins and owners only, and rejects other brand calls", () => {
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Admin)).toBe(true);
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Owner)).toBe(true);
    expect(allowed(HttpMethod.Get, "brands", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Put, "brands/b1", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Post, "admin/brands/b1/approve", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Patch, "admin/brands/b1/approve/extra", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Get, "brands/b1/features", AuthActor.Admin)).toBe(false);
  });
});

describe("proxy allow-list: admin catalog", () => {
  it.each([
    [HttpMethod.Get, "admin/catalog-categories"],
    [HttpMethod.Post, "admin/catalog-categories"],
    [HttpMethod.Put, "admin/catalog-categories/c1"],
    [HttpMethod.Delete, "admin/catalog-categories/c1"],
    [HttpMethod.Patch, "admin/catalog-categories/c1/active"],
    [HttpMethod.Get, "admin/catalog-items"],
  ])("lets an admin %s %s", (method, path) => {
    expect(allowed(method, path, AuthActor.Admin)).toBe(true);
  });

  it.each([AuthActor.Manager, AuthActor.Owner, AuthActor.Barber])("refuses every catalog path to %s", (guard) => {
    expect(allowed(HttpMethod.Get, "admin/catalog-categories", guard)).toBe(false);
    expect(allowed(HttpMethod.Post, "admin/catalog-categories", guard)).toBe(false);
    expect(allowed(HttpMethod.Patch, "admin/catalog-categories/c1/active", guard)).toBe(false);
    expect(allowed(HttpMethod.Get, "admin/catalog-items", guard)).toBe(false);
  });

  it("keeps catalog items read only and rejects unknown category paths", () => {
    expect(allowed(HttpMethod.Post, "admin/catalog-items", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Put, "admin/catalog-items/i1", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Delete, "admin/catalog-items/i1", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Patch, "admin/catalog-categories/c1", AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Get, "admin/catalog-categories/c1/children", AuthActor.Admin)).toBe(false);
  });
});

describe("proxy allow-list: the account page", () => {
  const everyone = [AuthActor.Admin, AuthActor.Manager, AuthActor.Barber, AuthActor.Owner];

  it.each(everyone)("lets %s read and edit their own profile, notifications and settings", (guard) => {
    for (const path of ["profile", "profile/notifications", "settings"]) {
      expect(allowed(HttpMethod.Get, path, guard)).toBe(true);
      expect(allowed(HttpMethod.Patch, path, guard)).toBe(true);
    }
    expect(allowed(HttpMethod.Post, "profile/email/change", guard)).toBe(true);
    expect(allowed(HttpMethod.Post, "profile/email/verify", guard)).toBe(true);
  });

  it("keeps the password change off the generic proxy and refuses other verbs and paths", () => {
    for (const guard of everyone) {
      expect(allowed(HttpMethod.Put, "profile/password", guard)).toBe(false);
      expect(allowed(HttpMethod.Delete, "profile", guard)).toBe(false);
      expect(allowed(HttpMethod.Get, "profile/email/change", guard)).toBe(false);
      expect(allowed(HttpMethod.Patch, "settings/extra", guard)).toBe(false);
    }
  });
});
