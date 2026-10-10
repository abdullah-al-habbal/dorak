import { describe, expect, it } from "vitest";
import { en } from "@/i18n/messages/en.constant";
import { getProfileBreadcrumbs, getProfileTabs } from "@/config/profile-ui.util";
import { ROUTES } from "@/config/routes.constant";

describe("profile UI model", () => {
  it("resolves profile UI model from config", () => {
    expect(getProfileTabs("admin")[0]?.href).toBe(ROUTES.portal.admin.profile.account);
    expect(getProfileBreadcrumbs("manager", en)).toEqual([
      { href: ROUTES.portal.manager.root, label: en.profile.home },
      { href: ROUTES.portal.manager.profile.root, label: en.profile.title },
    ]);
  });
});
