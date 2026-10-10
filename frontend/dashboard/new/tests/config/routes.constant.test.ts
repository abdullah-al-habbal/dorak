import { describe, expect, it } from "vitest";
import { PORTAL_ACTORS, PORTAL_CONFIG, ROUTES } from "@/config/routes.constant";

describe("route constants", () => {
  it("defines each profile tab below its actor portal", () => {
    expect(ROUTES.portal.manager.profile.security).toContain(ROUTES.portal.manager.profile.root);
    expect(ROUTES.portal.barber.profile.notification).toContain(ROUTES.portal.barber.profile.root);
  });

  it("derives portal actors from the actor configuration", () => {
    expect(PORTAL_ACTORS).toEqual(Object.keys(PORTAL_CONFIG));
  });
});
