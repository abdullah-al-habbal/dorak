import { describe, expect, it } from "vitest";

import { AuthActor } from "@/enums/auth-actor.enum";
import { decideRoute, guardFromPath, isSafeCallback } from "@/services/api/auth/route-policy.util";

const base = { search: "", hasSessionCookies: false };

describe("guardFromPath", () => {
  it("extracts only known guards", () => {
    expect(guardFromPath("/dashboard/admin/bookings")).toBe(AuthActor.Admin);
    expect(guardFromPath("/dashboard/nope")).toBeNull();
    expect(guardFromPath("/other/admin")).toBeNull();
  });
});

describe("isSafeCallback", () => {
  it("only allows same-portal, non-login paths", () => {
    expect(isSafeCallback("/dashboard/admin/bookings?x=1", AuthActor.Admin)).toBe(true);
    expect(isSafeCallback("/dashboard/manager", AuthActor.Admin)).toBe(false);
    expect(isSafeCallback("//evil.com", AuthActor.Admin)).toBe(false);
    expect(isSafeCallback("/dashboard/admin/..\\x", AuthActor.Admin)).toBe(false);
    expect(isSafeCallback("/dashboard/admin/login", AuthActor.Admin)).toBe(false);
    expect(isSafeCallback(undefined, AuthActor.Admin)).toBe(false);
  });
});

describe("decideRoute", () => {
  it("lets unknown paths through", () => {
    expect(decideRoute({ ...base, pathname: "/dashboard", claimActor: null }).kind).toBe("next");
  });

  it("answers unknown guard segments with not-found", () => {
    expect(decideRoute({ ...base, pathname: "/dashboard/nobody/login", claimActor: null }).kind).toBe("not-found");
  });

  it("sends anonymous users to the guard login with a callback", () => {
    const decision = decideRoute({ ...base, pathname: "/dashboard/admin/bookings", search: "?a=1", claimActor: null });
    expect(decision).toEqual({
      kind: "redirect",
      location: "/dashboard/admin/login?callbackUrl=%2Fdashboard%2Fadmin%2Fbookings%3Fa%3D1",
      clearCookies: true,
    });
  });

  it("keeps anonymous users on the login page", () => {
    expect(decideRoute({ ...base, pathname: "/dashboard/admin/login", claimActor: null }).kind).toBe("next");
  });

  it("bounces users away from another actor's portal", () => {
    expect(decideRoute({ ...base, pathname: "/dashboard/admin", claimActor: AuthActor.Manager })).toEqual({
      kind: "redirect",
      location: "/dashboard/manager",
    });
  });

  it("redirects signed-in users off the login page, honouring a safe callback", () => {
    const safe = decideRoute({
      ...base,
      pathname: "/dashboard/admin/login",
      search: "?callbackUrl=%2Fdashboard%2Fadmin%2Fbookings",
      claimActor: AuthActor.Admin,
    });
    expect(safe.location).toBe("/dashboard/admin/bookings");
    const unsafe = decideRoute({ ...base, pathname: "/dashboard/admin/login", search: "?callbackUrl=%2F%2Fevil.com", claimActor: AuthActor.Admin });
    expect(unsafe.location).toBe("/dashboard/admin");
  });
});

describe("decideRoute: password recovery pages", () => {
  it.each(["forgot-password", "reset-password"])("opens %s for anonymous visitors without clearing anything", (segment) => {
    expect(decideRoute({ ...base, pathname: `/dashboard/manager/${segment}`, hasSessionCookies: true, claimActor: null })).toEqual({ kind: "next" });
  });

  it.each(["forgot-password", "reset-password"])("opens %s for any signed-in actor, so a link works on a shared device", (segment) => {
    expect(decideRoute({ ...base, pathname: `/dashboard/manager/${segment}`, claimActor: AuthActor.Manager })).toEqual({ kind: "next" });
    expect(decideRoute({ ...base, pathname: `/dashboard/manager/${segment}`, claimActor: AuthActor.Owner })).toEqual({ kind: "next" });
  });

  it("still guards the account page", () => {
    expect(decideRoute({ ...base, pathname: "/dashboard/barber/account", claimActor: null }).kind).toBe("redirect");
    expect(decideRoute({ ...base, pathname: "/dashboard/barber/account", claimActor: AuthActor.Barber })).toEqual({ kind: "next" });
  });
});

describe("isSafeCallback: public auth pages", () => {
  it.each(["forgot-password", "reset-password", "login"])("never sends a signed-in user back to %s", (segment) => {
    expect(isSafeCallback(`/dashboard/admin/${segment}?token=x`, AuthActor.Admin)).toBe(false);
  });

  it("still accepts ordinary portal pages", () => {
    expect(isSafeCallback("/dashboard/admin/account", AuthActor.Admin)).toBe(true);
  });
});
