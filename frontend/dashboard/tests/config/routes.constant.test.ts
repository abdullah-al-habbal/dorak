import { describe, expect, it } from "vitest";
import {
  PORTAL_ACTORS,
  PORTAL_CONFIG,
  PORTAL_NAVIGATION,
  ROUTES,
} from "@/config/routes.constant";

describe("route constants", () => {
  it("defines each profile tab below its actor portal", () => {
    expect(ROUTES.portal.manager.profile.security).toContain(
      ROUTES.portal.manager.profile.root,
    );
    expect(ROUTES.portal.barber.profile.notification).toContain(
      ROUTES.portal.barber.profile.root,
    );
  });

  it("derives portal actors from the actor configuration", () => {
    expect(PORTAL_ACTORS).toEqual(Object.keys(PORTAL_CONFIG));
  });

  it("gives brand owners their own portal with the operations destinations", () => {
    expect(ROUTES.portal.owner.login).toBe("/owner/login");
    const ownerKeys = PORTAL_NAVIGATION.filter((item) =>
      item.actors.includes("owner"),
    ).map((item) => item.key);

    expect(ownerKeys).toEqual([
      "overview",
      "branches",
      "floorPlan",
      "reviews",
      "affiliations",
      "jobPostings",
      "bookings",
      "services",
      "chairs",
      "stylists",
    ]);
    expect(ROUTES.operations.resource("owner", "branches")).toBe(
      "/owner/branches",
    );
  });

  it("offers moderation destinations to platform admins only", () => {
    const moderationKeys = ["disputedReviews", "exchangeRates"];
    const actorsFor = (key: string) =>
      PORTAL_NAVIGATION.find((item) => item.key === key)?.actors;

    moderationKeys.forEach((key) => expect(actorsFor(key)).toEqual(["admin"]));
    expect(ROUTES.admin.disputedReviews).toBe("/admin/disputed-reviews");
    expect(ROUTES.admin.exchangeRates).toBe("/admin/exchange-rates");
  });

  it("keeps the operations destinations away from barbers", () => {
    const barberKeys = PORTAL_NAVIGATION.filter((item) =>
      item.actors.includes("barber"),
    ).map((item) => item.key);

    expect(barberKeys).toEqual(["dashboard"]);
  });
});
