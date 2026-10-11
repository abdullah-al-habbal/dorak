import { describe, expect, it } from "vitest";
import { ROUTES } from "@/config/routes.constant";
import {
  isProtectedPath,
  isPublicPath,
  isSafeCallback,
  loginActorFromPath,
  portalActorFromPath,
  redirectTargetForPath,
} from "@/services/api/auth/route-policy.util";

describe("loginActorFromPath", () => {
  it("recognises portal login routes", () => {
    expect(loginActorFromPath(ROUTES.portal.admin.login)).toBe("admin");
    expect(loginActorFromPath(ROUTES.portal.manager.login)).toBe("manager");
    expect(loginActorFromPath(ROUTES.portal.barber.login)).toBe("barber");
  });

  it("ignores other routes", () => {
    expect(loginActorFromPath(ROUTES.portal.admin.root)).toBeNull();
    expect(loginActorFromPath(ROUTES.portal.admin.profile.account)).toBeNull();
    expect(loginActorFromPath(ROUTES.forbidden)).toBeNull();
  });
});

describe("portalActorFromPath", () => {
  it("maps portal roots and nested routes to their actor", () => {
    expect(portalActorFromPath(ROUTES.portal.admin.root)).toBe("admin");
    expect(portalActorFromPath(ROUTES.portal.manager.profile.account)).toBe(
      "manager",
    );
    expect(portalActorFromPath(ROUTES.portal.barber.profile.security)).toBe(
      "barber",
    );
  });

  it("does not treat login routes as protected portal routes", () => {
    expect(portalActorFromPath(ROUTES.portal.admin.login)).toBeNull();
  });
});

describe("isProtectedPath / isPublicPath", () => {
  it("classifies public routes", () => {
    expect(isPublicPath(ROUTES.home)).toBe(true);
    expect(isPublicPath(ROUTES.forbidden)).toBe(true);
    expect(isPublicPath(ROUTES.portal.admin.root)).toBe(false);
  });

  it("marks portal routes as protected", () => {
    expect(isProtectedPath(ROUTES.portal.admin.root)).toBe(true);
    expect(isProtectedPath(ROUTES.portal.admin.login)).toBe(false);
    expect(isProtectedPath(ROUTES.forbidden)).toBe(false);
    expect(isProtectedPath(ROUTES.home)).toBe(false);
  });
});

describe("redirectTargetForPath", () => {
  it("falls back to the default actor for actor-less paths", () => {
    expect(redirectTargetForPath(ROUTES.portal.manager.profile.account)).toBe(
      "manager",
    );
    expect(redirectTargetForPath(ROUTES.forbidden)).toBe("admin");
  });
});

describe("isSafeCallback", () => {
  it("accepts callbacks scoped to the actor portal", () => {
    expect(isSafeCallback(ROUTES.portal.admin.profile.account, "admin")).toBe(
      true,
    );
    expect(isSafeCallback(ROUTES.forbidden, "admin")).toBe(false);
  });

  it("rejects cross-portal, protocol-relative, and absolute callbacks", () => {
    expect(isSafeCallback(ROUTES.portal.manager.root, "admin")).toBe(false);
    expect(
      isSafeCallback(`${ROUTES.home}${ROUTES.home}evil.example.com`, "admin"),
    ).toBe(false);
    expect(isSafeCallback("https://evil.example.com", "admin")).toBe(false);
    expect(isSafeCallback(`${ROUTES.portal.admin.root}\\..\\..`, "admin")).toBe(
      false,
    );
    expect(isSafeCallback(undefined, "admin")).toBe(false);
  });
});
