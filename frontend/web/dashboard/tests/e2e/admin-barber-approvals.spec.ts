import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, expectDirectoryRow, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "admin", segment: "barber-approvals", title: (dictionary) => dictionary.barberApprovals.title };

test.describe("admin barber approvals", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("shows the barber directory with its columns", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    const { filters, columns } = dictionary.barberApprovals;
    // Pending review is the default filter and is empty in the seed, so widen it to see the seeded stylist.
    await expect(page.getByRole("group", { name: filters.toolbar })).toBeVisible();
    await page.getByRole("combobox", { name: filters.status }).selectOption({ label: filters.allStatuses });
    await expectDirectoryRow(page, { email: "omar.e2e@dorak.test", emailColumn: columns.email });
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
