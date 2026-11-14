import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "admin", segment: "currencies", title: (dictionary) => dictionary.currencies.title };

test.describe("admin currencies", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("offers the currencies and the exchange rates tabs", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    await expect(page.getByRole("button", { name: dictionary.currencies.tabs.currencies })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: dictionary.currencies.tabs.rates }).click();
    await expect(page.getByRole("button", { name: dictionary.currencies.tabs.rates })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
