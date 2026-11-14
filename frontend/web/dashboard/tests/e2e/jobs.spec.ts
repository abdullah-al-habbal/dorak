import { expect, test } from "@playwright/test";

import { E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { expectDarkScheme, openModule } from "@tests/e2e/support/module-page";
import type { ModulePage } from "@tests/e2e/support/module-page";

const MODULE: ModulePage = { guard: "manager", segment: "jobs", title: (dictionary) => dictionary.jobs.title };

test.describe("job postings", () => {
  test.use({ storageState: E2E_STORAGE_STATE });

  test("opens the job board of the manager branch", async ({ page }) => {
    const dictionary = await openModule(page, MODULE);
    await expect(page.getByRole("button", { name: dictionary.jobs.newPosting }).or(page.getByRole("link", { name: dictionary.jobs.newPosting }))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await openModule(page, MODULE, "ar");
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await expectDarkScheme(page, MODULE);
  });
});
