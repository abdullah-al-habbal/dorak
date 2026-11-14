import { expect, test } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "owner", segment: "brand", title: (dictionary) => dictionary.ownerBrand.title };

test.describe("owner brand", () => {
  test.use({ storageState: E2E_OWNER_STORAGE_STATE });

  test("shows the owner brand with its add action", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    await expect(page.getByText(dictionary.ownerBrand.add).first()).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
