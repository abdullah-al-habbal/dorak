import { expect, test } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en").subscription;
const ar = dictionaryFor("ar").subscription;

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

test.describe("owner subscription", () => {
  test("shows the plan, price, status and features", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/subscription");
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "E2E Growth" })).toBeVisible();
    await expect(page.getByTestId("plan-price")).toContainText("49");
    await expect(page.getByText(en.status.active, { exact: true })).toBeVisible();
    await expect(page.getByText(en.features.labels.multi_branch)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "owner");
    await page.goto("/dashboard/owner/subscription");
    await expect(page.getByRole("heading", { level: 1, name: ar.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "نمو الاختبار" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
