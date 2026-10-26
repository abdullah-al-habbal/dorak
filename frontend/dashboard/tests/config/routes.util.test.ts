import { readFileSync } from "node:fs";
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
  it("resolves the barber dashboard link from centralized routes", () => {
    expect(
      getPortalNavigation("barber", []).find((item) => item.key === "dashboard")
        ?.href,
    ).toBe(ROUTES.portal.barber.root);
  });

  it.each(["admin", "manager", "owner"] as const)(
    "has no duplicate dashboard link for the %s operations actor (overview covers it)",
    (actor) => {
      expect(
        getPortalNavigation(actor, []).some((item) => item.key === "dashboard"),
      ).toBe(false);
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

  it.each(["admin", "manager", "owner"] as const)(
    "redirects the %s portal root to its overview route instead of a placeholder shell",
    (actor) => {
      const source = readFileSync(
        `src/app/(portals)/${actor}/page.tsx`,
        "utf-8",
      );
      expect(source).toContain(`ROUTES.operations.overview("${actor}")`);
      expect(source).not.toContain("createPortalPage");
    },
  );
});
