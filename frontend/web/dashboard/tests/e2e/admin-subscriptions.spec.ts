import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

import { PLAN_OPTIONS_LIMIT } from "@/config/plan.constant";
import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.adminSubscriptions;
const SUBSCRIPTIONS = "/dashboard/admin/subscriptions";
const PLANS_API = "/api/dashboard/admin/subscription-plans";

/** Follows a sidebar link without a full reload, so the query cache survives (opens the menu on phones). */
async function navigateTo(page: Page, name: string): Promise<void> {
  const link = page.getByRole("link", { name, exact: true }).locator("visible=true").first();
  if (!(await link.isVisible())) await page.getByRole("button", { name: en.shell.openMenu }).click();
  await page.getByRole("link", { name, exact: true }).locator("visible=true").first().click();
}

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

    // Pick a deterministic brand by name (not by position): the seeded pending brand, which has no subscription.
    // Every reset removes subscriptions of brands other than the E2E brand.
    await dialog.getByLabel(t.assignDialog.brand).selectOption({ label: "E2E Pending Cuts" });
    await dialog.getByLabel(t.assignDialog.plan).selectOption({ label: "E2E Growth" });
    await dialog.getByRole("button", { name: t.assignDialog.submit }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.toast.assigned)).toBeVisible();
  });

  test("caches the assign dialog's plan options until a plan is saved", async ({ page }) => {
    let optionRequests = 0;
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname === PLANS_API && url.searchParams.get("per_page") === String(PLAN_OPTIONS_LIMIT)) optionRequests += 1;
    });
    await signIn(page, "en", "admin");
    await page.goto(SUBSCRIPTIONS);

    const dialog = page.getByRole("dialog");
    const planSelect = dialog.getByLabel(t.assignDialog.plan);
    await page.getByRole("button", { name: t.assign }).click();
    await expect(planSelect).toContainText("E2E Growth");
    await expect(planSelect).not.toContainText("E2E Legacy");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // Reopening inside the cache window reuses the options instead of refetching them.
    await page.getByRole("button", { name: t.assign }).click();
    await expect(planSelect).toContainText("E2E Growth");
    expect(optionRequests).toBe(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // Activating a plan invalidates every plan key, so the next open lists it.
    await navigateTo(page, en.shell.nav.plans);
    await expect(page.getByRole("heading", { level: 1, name: en.plans.title })).toBeVisible();
    await page.getByText("E2E Legacy").locator("visible=true").first().click();
    await dialog.getByRole("switch", { name: en.plans.form.active }).click();
    await dialog.getByRole("button", { name: en.plans.form.save }).click();
    await expect(dialog).toBeHidden();

    await navigateTo(page, en.shell.nav.subscriptions);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await page.getByRole("button", { name: t.assign }).click();
    await expect(planSelect).toContainText("E2E Legacy");
    expect(optionRequests).toBe(2);
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
