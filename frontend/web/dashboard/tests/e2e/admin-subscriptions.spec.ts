import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.adminSubscriptions;
const SUBSCRIPTIONS = "/dashboard/admin/subscriptions";

test.describe("admin subscriptions", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the seeded subscription and filters by status", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SUBSCRIPTIONS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
    await expect(page.getByText("E2E Growth").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByLabel(t.filters.status).selectOption("cancelled");
    await expect(page).toHaveURL(/status=cancelled/);
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
  });

  test("moves an active subscription to past due and back, then cancels it", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SUBSCRIPTIONS);

    await page.getByRole("button", { name: new RegExp(`^${t.actions.past_due}:`) }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: t.confirm.past_due.title })).toBeVisible();
    await dialog.getByRole("button", { name: t.confirm.past_due.confirm }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.toast.updated)).toBeVisible();
    await expect(page.getByText(en.subscription.status.past_due, { exact: true }).locator("visible=true").first()).toBeVisible();

    await page.getByRole("button", { name: new RegExp(`^${t.actions.active}:`) }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.active.confirm }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.getByRole("button", { name: new RegExp(`^${t.actions.cancelled}:`) }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.cancelled.confirm }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    // A cancelled subscription has no further moves.
    await expect(page.getByRole("button", { name: /^(Activate|Mark past due|Cancel subscription):/ })).toHaveCount(0);
  });

  test("assigns an active plan to a brand", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SUBSCRIPTIONS);
    await page.getByRole("button", { name: t.assign }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: t.assignDialog.submit }).click();
    await expect(dialog.getByText(t.assignDialog.validation.brand)).toBeVisible();
    await expect(dialog.getByText(t.assignDialog.validation.plan)).toBeVisible();

    // The only brand with a subscription is the seeded one; pick the first brand and the active seeded plan.
    await dialog.getByLabel(t.assignDialog.brand).selectOption({ index: 1 });
    await dialog.getByLabel(t.assignDialog.plan).selectOption({ label: "E2E Growth" });
    await dialog.getByRole("button", { name: t.assignDialog.submit }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.toast.assigned)).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(SUBSCRIPTIONS);
    await expect(page.getByRole("heading", { level: 1, name: ar.adminSubscriptions.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "admin");
    await page.goto(SUBSCRIPTIONS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});
