import { expect, test } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en").payouts;
const ar = dictionaryFor("ar").payouts;

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

test.describe("owner payouts", () => {
  test("lists non-draft payouts and hides the draft", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/payouts");
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();

    // Seeded: paid, approved and cancelled are listed; the fourth (draft) is internal.
    await expect(page.getByText(en.states.results.replace("{count}", "3"))).toBeVisible();
    await expect(page.getByText("E2E-REF-1").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText(en.status.draft, { exact: true })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
  });

  test("filters by status and keeps it in the URL", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/payouts");
    await page.getByLabel(en.filters.status).selectOption("paid");
    await expect(page).toHaveURL(/status=paid/);
    await expect(page.getByText(en.states.results.replace("{count}", "1"))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "owner");
    await page.goto("/dashboard/owner/payouts");
    await expect(page.getByRole("heading", { level: 1, name: ar.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
