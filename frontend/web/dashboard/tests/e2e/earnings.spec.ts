import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { earnings } = dictionaryFor("en");
const arabic = dictionaryFor("ar");

test.describe("earnings", () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test("shows revenue, charts and the daily table for the last 30 days", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/earnings");
    await expect(page.getByRole("heading", { level: 1, name: earnings.title })).toBeVisible();
    await expect(page.getByText(earnings.averageTicket, { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: /Revenue by day/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Completed bookings by day/ })).toBeVisible();
    await expect(page.getByRole("button", { name: `Sort by ${earnings.table.revenue}` })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("narrows to today and shows the empty state, then recovers", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/earnings");
    await page.getByRole("button", { name: earnings.range.presets.today }).click();
    await expect(page.getByText(earnings.states.emptyTitle)).toBeVisible();
    await expect(page).toHaveURL(/from=/);
    await page.getByRole("button", { name: earnings.range.presets["30d"] }).click();
    await expect(page.getByRole("img", { name: /Revenue by day/ })).toBeVisible();
  });

  test("rejects an inverted custom range without changing the URL", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/earnings?from=2026-01-01&to=2026-01-31");
    // Wait for the data (and so hydration) before typing, or the change event is lost.
    await expect(page.getByText(earnings.states.emptyTitle)).toBeVisible();
    await page.getByLabel(earnings.range.to, { exact: true }).fill("2025-12-01");
    await expect(page.getByRole("alert").filter({ hasText: earnings.range.issues.inverted })).toBeVisible();
    await expect(page).toHaveURL(/from=2026-01-01&to=2026-01-31/);
  });

  test("renders right-to-left with Arabic copy", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto("/dashboard/manager/earnings");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: arabic.earnings.title })).toBeVisible();
    await expect(page.getByRole("img", { name: /الإيرادات حسب/ })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
