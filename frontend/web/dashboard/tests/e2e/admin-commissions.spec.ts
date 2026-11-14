import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "admin", segment: "commissions", title: (dictionary) => dictionary.commissions.title };

test.describe("admin commissions", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("offers the rules and the ledger tabs", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    await expect(page.getByRole("button", { name: dictionary.commissions.tabs.rules })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: dictionary.commissions.tabs.ledger }).click();
    await expect(page.getByRole("button", { name: dictionary.commissions.tabs.ledger })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
