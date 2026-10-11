import { describe, expect, it } from "vitest";
import { en } from "@/i18n/messages/en.constant";
import { PORTAL_ACTORS, ROUTES } from "@/config/routes.constant";
import {
  getActivePortalNavigation,
  getPortalAuthTitle,
  getPortalNavigation,
  getPortalTitle,
  getPublicPortalLinks,
  portalProfileFor,
} from "@/config/routes.util";

describe("getPortalNavigation", () => {
  it.each([
    ["admin", ROUTES.portal.admin.root],
    ["manager", ROUTES.portal.manager.root],
    ["barber", ROUTES.portal.barber.root],
  ] as const)(
    "resolves %s dashboard from centralized routes",
    (actor, expectedHome) => {
      expect(
        getPortalNavigation(actor, []).find((item) => item.key === "dashboard")
          ?.href,
      ).toBe(expectedHome);
    },
  );

  it("keeps profile navigation in the header menu, not the sidebar", () => {
    expect(
      getPortalNavigation("admin", []).some((item) => item.key === "profile"),
    ).toBe(false);
  });

  it("derives public links and titles from actor configuration", () => {
    expect(getPublicPortalLinks(en).map((item) => item.actor)).toEqual(
      PORTAL_ACTORS,
    );
    expect(getPortalAuthTitle("manager", en)).toBe(en.auth.managerTitle);
    expect(getPortalTitle("barber", en)).toBe(en.portal.barberTitle);
  });

  it("resolves actor profile routes", () => {
    expect(portalProfileFor("barber")).toBe(ROUTES.portal.barber.profile);
  });

  it("marks only the most specific matching sidebar route active", () => {
    const items = [
      { key: "dashboard", href: "/admin" },
      { key: "overview", href: "/admin/overview" },
    ];

    expect(getActivePortalNavigation(items, "/admin/overview")).toEqual([
      false,
      true,
    ]);
  });
});
