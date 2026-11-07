import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.analytics;
const ANALYTICS = "/dashboard/admin/analytics";

test.describe("admin analytics", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("shows bookings, money, plans and platform size for the period", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(ANALYTICS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: t.bookings.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: t.money.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: t.plans.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: t.platform.title })).toBeVisible();
    // The seeded completed history plus the live subscription of the E2E brand.
    await expect(page.getByRole("img", { name: /Completed bookings by day/ })).toBeVisible();
    await expect(page.getByText(en.bookings.status.completed, { exact: true })).toBeVisible();
    await expect(page.getByText("E2E Growth")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("keeps the chosen period in the URL and reloads the figures", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(ANALYTICS);
    const sevenDays = page.getByRole("button", { name: en.earnings.range.presets["7d"] });
    await sevenDays.click();
    await expect(page).toHaveURL(/from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}/);
    await expect(sevenDays).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { level: 2, name: t.bookings.title })).toBeVisible();

    await page.reload();
    await expect(sevenDays).toHaveAttribute("aria-pressed", "true");
  });

  test("shows a period with no bookings as empty states", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(`${ANALYTICS}?from=2020-01-01&to=2020-01-31`);
    await expect(page.getByText(t.bookings.noneCompleted)).toBeVisible();
    await expect(page.getByText(t.bookings.noneInPeriod)).toBeVisible();
  });

  test("renders in Arabic, right to left, without overflow", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(ANALYTICS);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: ar.analytics.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: ar.analytics.money.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe("analytics for other guards", () => {
  test("a manager sees the forbidden state", async ({ page }) => {
    await signIn(page, "en", "manager");
    await page.goto("/dashboard/manager/analytics");
    await expect(page.getByText(t.states.forbiddenTitle)).toBeVisible();
  });
});
