import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const PAGE = "/dashboard/manager/notifications";

// Seeded for the manager (E2eDashboardSeeder::managerNotifications): 17 rows, 3 unread, 15 per page.
const TOTAL = 17;
const UNREAD = 3;
const PAGE_SIZE = 15;

test.describe("notifications page", () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test("the bell links to the full page", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: en.shell.notifications.titleWithCount.replace("{count}", String(UNREAD)) }).click();
    await page.getByRole("link", { name: en.shell.notifications.viewAll }).click();
    await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
    await expect(page.getByRole("heading", { level: 1, name: en.shell.notifications.title })).toBeVisible();
  });

  test("pages through the whole inbox", async ({ page }) => {
    await signIn(page);
    await page.goto(PAGE);
    await expect(page.getByText(en.notificationsPage.results.replace("{count}", String(TOTAL)))).toBeVisible();
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(PAGE_SIZE);

    await page.getByRole("button", { name: en.common.pagination.next }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(TOTAL - PAGE_SIZE);
    await expectNoHorizontalScroll(page);
  });

  test("the unread filter and mark all read", async ({ page }) => {
    await signIn(page);
    await page.goto(PAGE);
    await page.getByRole("button", { name: en.notificationsPage.unreadOnly.replace("{count}", String(UNREAD)) }).click();
    await expect(page).toHaveURL(/unread=1/);
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(UNREAD);

    await page.getByRole("button", { name: en.shell.notifications.markAll }).click();
    await expect(page.getByText(en.notificationsPage.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: en.notificationsPage.all, exact: true }).first().click();
    await expect(page.getByText(en.notificationsPage.results.replace("{count}", String(TOTAL)))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto(PAGE);
    await expect(page.getByRole("heading", { level: 1, name: ar.shell.notifications.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });
});
