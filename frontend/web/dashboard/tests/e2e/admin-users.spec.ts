import { test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, expectDirectoryRow, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "admin", segment: "admins", title: (dictionary) => dictionary.adminUsers.title };

test.describe("admin users", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("lists the seeded platform admins", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    await expectDirectoryRow(page, { email: "admin@dorak.sy", emailColumn: dictionary.adminUsers.columns.email });
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
